const mongoose = require("mongoose");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const adminDbUri = process.env.ADMIN_MONGO_URI;
if (!adminDbUri) {
    throw new Error("ADMIN_MONGO_URI is not configured. Set it to your remote admin database URI.");
}
const adminDbConnection = mongoose.createConnection(adminDbUri);
const adminPatientSchema = new mongoose.Schema(
    {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        contactNumber: String,
        email: String,
        gender: String,
        medicalHistory: String,
        roomNo: String,
    },
    { collection: "patients" }
);
const AdminPatient = adminDbConnection.models.AdminPatient || adminDbConnection.model("AdminPatient", adminPatientSchema);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeName = (value) => value.trim().replace(/\s+/g, " ").toLowerCase();

const normalizeDob = (dob) => {
    const trimmedDob = dob.trim();
    const parsed = new Date(trimmedDob);

    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10);
    }

    return trimmedDob;
};

const getDateRangeForDob = (dob) => {
    const parsed = new Date(`${dob}T00:00:00.000Z`);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    const nextDay = new Date(parsed);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    return { start: parsed, end: nextDay };
};

const findAdminPatient = async (name, normalizedDob) => {
    const dateRange = getDateRangeForDob(normalizedDob);
    if (!dateRange) {
        return null;
    }

    const normalizedInputName = normalizeName(name);
    const candidatePatients = await AdminPatient.find({
        dateOfBirth: {
            $gte: dateRange.start,
            $lt: dateRange.end,
        },
    }).lean();

    return candidatePatients.find((patient) => {
        const firstName = patient.firstName || "";
        const lastName = patient.lastName || "";
        const fullName = `${firstName} ${lastName}`.trim();

        return [fullName, firstName, lastName]
            .filter(Boolean)
            .some((candidateName) => normalizeName(candidateName) === normalizedInputName);
    }) || null;
};

const loginUser = async (req, res) => {
    try {
        let { name, dob } = req.body;

        if (!name || !dob) {
            return res.status(400).json({ message: "Name and DOB are required" });
        }

        const originalName = name.trim();
        const normalizedDob = normalizeDob(dob);
        const adminPatient = await findAdminPatient(originalName, normalizedDob);

        if (!adminPatient) {
            // Fallback: allow existing local patient accounts if admin sync record is temporarily unavailable.
            const localPatient = await User.findOne({
                name: { $regex: new RegExp(`^${escapeRegex(originalName)}$`, "i") },
                dob: normalizedDob,
            });

            if (localPatient) {
                const token = jwt.sign({ id: localPatient._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
                return res.json({
                    message: "Login successful",
                    token,
                    user: localPatient,
                    created: false,
                });
            }

            console.log(`❌ Login blocked: ${originalName} is not registered in admin dashboard.`);
            return res.status(403).json({
                message: "Patient account not found. Ask the admin to register you first.",
            });
        }

        const adminFullName = `${adminPatient.firstName || ""} ${adminPatient.lastName || ""}`.trim();
        const storedName = adminFullName || originalName;

        let user = await User.findOne({
            $or: [
                { adminPatientId: String(adminPatient._id) },
                {
                    name: { $regex: new RegExp(`^${escapeRegex(storedName)}$`, "i") },
                    dob: normalizedDob,
                },
            ],
        });

        const syncedPatientFields = {
            adminPatientId: String(adminPatient._id),
            name: storedName,
            dob: normalizedDob,
            phone: adminPatient.contactNumber || "",
            email: adminPatient.email || "",
            gender: adminPatient.gender || "",
            roomNo: adminPatient.roomNo || "",
            medicalHistory: adminPatient.medicalHistory || "",
        };

        if (!user) {
            user = await User.create({
                ...syncedPatientFields,
                requests: [],
            });
            console.log(`✅ Admin-registered patient linked: ${user.name}, DOB: ${user.dob}`);
        } else {
            user.set(syncedPatientFields);
            await user.save();
            console.log(`✅ Admin-registered patient login: ${user.name}, DOB: ${user.dob}`);
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });

        res.json({
            message: "Login successful",
            token,
            user,
            created: false,
        });
    } catch (error) {
        console.error("❌ Error in loginUser:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { loginUser };
