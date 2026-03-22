const mongoose = require("mongoose");
const objVariables = require('../common/variables');
const objMessages = require('../common/messages');

const patientDbUri = process.env.PATIENT_MONGO_URI;
if (!patientDbUri) {
    throw new Error("PATIENT_MONGO_URI is not configured. Set it to your remote patient database URI.");
}
const patientDbConnection = mongoose.createConnection(patientDbUri);
const requestSchema = new mongoose.Schema(
    {
        patientName: String,
        requestText: String,
        timestamp: Date,
        status: { type: String, enum: ["pending", "inProgress", "completed"], default: "pending" },
        assignedNurseId: String,
        assignedNurseName: String,
    },
    { collection: "requests" }
);
const NurseTask = patientDbConnection.models.NurseTask || patientDbConnection.model("NurseTask", requestSchema);
const NurseUser = require("../models/users");

const patientUserSchema = new mongoose.Schema(
    {
        adminPatientId: String,
        name: String,
        dob: String,
        phone: String,
        email: String,
        gender: String,
        roomNo: String,
    },
    { collection: "users" }
);
const PatientUser = patientDbConnection.models.PatientUser || patientDbConnection.model("PatientUser", patientUserSchema);

const isLikelyObjectId = (value) => mongoose.Types.ObjectId.isValid(value) && String(new mongoose.Types.ObjectId(value)) === value;

const getPatientDetails = async (patientRef) => {
    if (!patientRef) return null;

    const ref = String(patientRef).trim();
    const lookup = [{ adminPatientId: ref }, { name: ref }];

    if (isLikelyObjectId(ref)) {
        lookup.unshift({ _id: new mongoose.Types.ObjectId(ref) });
    }

    return PatientUser.findOne({ $or: lookup }).lean();
};

//#region Nurse -Patient Task
const serCreatePatientRequest = async (patientID, nurseID, request,reqstatus, res) => {
    try 
    {
        let assignedNurseName = "";
        if (nurseID) {
            const nurse = await NurseUser.findById(String(nurseID)).lean();
            assignedNurseName = nurse?.name || "";
        }

        const newRequest = new NurseTask({
            patientName: String(patientID || "Unknown Patient"),
            requestText: request,
            status: reqstatus || "pending",
            assignedNurseId: nurseID ? String(nurseID) : "",
            assignedNurseName,
            timestamp: new Date(),
        });
        await newRequest.save();
        return res.status(objVariables.CreatedSuccessCode).json({ status : objMessages.Success , message :objMessages.PatientRequestCreatedSucessfully});
    } 
    catch (error) 
    {
        console.log(objMessages.ServiceError, error.message);
        return res.status(objVariables.ServerErrorCode).json({ status : objMessages.Failure, message: objMessages.SomethingWentWrong, error : error.message});
    }
};

const serUpdatePatientRequestStatus = async (requestId, reqstatus, intNurseID,res) => {
    try 
    {
        const current = await NurseTask.findById(requestId);
        if (!current) {
            return res.status(objVariables.NotFound).json({ status: objMessages.Failure, message: "Task not found" });
        }

        if (current.assignedNurseId && current.assignedNurseId !== String(intNurseID)) {
            return res.status(403).json({ status: objMessages.Failure, message: "Task is assigned to another nurse." });
        }

        const nurse = await NurseUser.findById(String(intNurseID)).lean();
        const updatedRequest = await NurseTask.findByIdAndUpdate(
            requestId,
            {
                status: reqstatus,
                assignedNurseId: String(intNurseID),
                assignedNurseName: nurse?.name || "",
            },
            { new: true }
        );

        if (!updatedRequest) {
            return res.status(objVariables.NotFound).json({ status: objMessages.Failure, message: "Task not found" });
        }

        return res.status(objVariables.SuccessCode).json({ status : objMessages.Success , message :objMessages.PatientRequestUpdatedSuccessfully });
    } 
    catch (error) 
    {
        console.log(objMessages.ServiceError, error.message);
        return res.status(objVariables.ServerErrorCode).json({ status : objMessages.Failure, message: objMessages.SomethingWentWrong, error : error.message});
    }
};

const serGetPatientRequests = async (intNurseID,res) => {
    try 
    {
        const requests = await NurseTask.find({
            assignedNurseId: String(intNurseID),
        }).sort({ timestamp: -1 });

        const detailsCache = new Map();
        const getFromCache = async (key) => {
            const cacheKey = String(key || "").trim().toLowerCase();
            if (!cacheKey) return null;
            if (detailsCache.has(cacheKey)) return detailsCache.get(cacheKey);
            const details = await getPatientDetails(key);
            detailsCache.set(cacheKey, details);
            return details;
        };

        return Promise.all(
            requests.map(async (task) => {
                const patientDetails = await getFromCache(task.patientName);
                const displayPatientName = patientDetails?.name || task.patientName || "Patient";

                return {
                    _id: task._id,
                    request: `${displayPatientName}: ${task.requestText}`,
                    status: task.status || "pending",
                    assignedNurseId: task.assignedNurseId || "",
                    assignedNurseName: task.assignedNurseName || "",
                    patientName: displayPatientName,
                    requestText: task.requestText || "",
                    timestamp: task.timestamp,
                    patientDetails: {
                        patientId: patientDetails?.adminPatientId || (patientDetails?._id ? String(patientDetails._id) : ""),
                        roomNo: patientDetails?.roomNo || "",
                        phone: patientDetails?.phone || "",
                        gender: patientDetails?.gender || "",
                        dob: patientDetails?.dob || "",
                    },
                };
            })
        );
    } 
    catch (error) 
    {
        console.log(objMessages.ServiceError, error.message);
        return res.status(objVariables.ServerErrorCode).json({ status : objMessages.Failure, message: objMessages.SomethingWentWrong, error : error.message});
    }
};

const serAssignPatientRequest = async (requestId, intNurseID, res) => {
    try {
        const task = await NurseTask.findById(requestId);
        if (!task) {
            return res.status(objVariables.NotFound).json({ status: objMessages.Failure, message: "Task not found" });
        }

        if (task.assignedNurseId && task.assignedNurseId !== String(intNurseID)) {
            return res.status(409).json({ status: objMessages.Failure, message: "Task already assigned to another nurse." });
        }

        const nurse = await NurseUser.findById(String(intNurseID)).lean();
        task.assignedNurseId = String(intNurseID);
        task.assignedNurseName = nurse?.name || "";
        await task.save();

        return res.status(objVariables.SuccessCode).json({ status: objMessages.Success, message: "Task assigned successfully." });
    } catch (error) {
        console.log(objMessages.ServiceError, error.message);
        return res.status(objVariables.ServerErrorCode).json({ status : objMessages.Failure, message: objMessages.SomethingWentWrong, error : error.message});
    }
};
//#endregion

//#region Hospital Patients
const serGetHospitalPatients = async (res) => {
    try
    {
        const patients = await PatientUser.find({
            $or: [
                { roomNo: { $exists: true, $ne: "" } },
                { name: { $exists: true, $ne: "" } },
            ],
        })
        .sort({ name: 1 })
        .lean();

        return patients.map((patient) => ({
            id: patient.adminPatientId || String(patient._id),
            name: patient.name || "Unknown Patient",
            room: patient.roomNo || "NA",
            contact: patient.phone || "",
            gender: patient.gender || "",
            email: patient.email || "",
            dob: patient.dob || "",
            description: "Current hospital patient",
        }));
    }
    catch (error)
    {
        console.log(objMessages.ServiceError, error.message);
        return res.status(objVariables.ServerErrorCode).json({ status : objMessages.Failure, message: objMessages.SomethingWentWrong, error : error.message});
    }
};
//#endregion

module.exports = {
    serCreatePatientRequest,
    serUpdatePatientRequestStatus,
    serAssignPatientRequest,
    serGetPatientRequests,
    serGetHospitalPatients,
};
