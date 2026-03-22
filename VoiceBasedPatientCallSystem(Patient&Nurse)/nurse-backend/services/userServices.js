const mongoose = require("mongoose");
const objVariables = require('../common/variables');
const objMessages = require('../common/messages');
const objUserData  = require("../models/users");
const jwt = require("jsonwebtoken");

// Single persistent connection to voicebased_admin
const adminDbUri = process.env.ADMIN_MONGO_URI;
if (!adminDbUri) {
  throw new Error("ADMIN_MONGO_URI is not configured. Set it to your remote admin database URI.");
}
const adminDbConnection = mongoose.createConnection(adminDbUri);
const adminNurseSchema = new mongoose.Schema(
  { name: String, department: String, role: String,
    contactNumber: String, licenseNumber: String, status: String },
  { collection: "nurses" }
);
const AdminNurse = adminDbConnection.models.AdminNurse ||
  adminDbConnection.model("AdminNurse", adminNurseSchema);

const normalizeName = (val) => val.trim().replace(/\s+/g, " ").toLowerCase();
const escapeRegex  = (val) => val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const exactCaseInsensitive = (val) => new RegExp(`^${escapeRegex((val || "").trim())}$`, "i");

//#region Verify User (admin-gated: name + licenseNumber)
const serVerifyUser = async (strName, strLicense, res) => {
  try {
    strName    = (strName    || "").trim();
    strLicense = (strLicense || "").trim();

    if (!strName || !strLicense)
      return res.status(objVariables.BadRequest).json({ status: objMessages.Failure, message: "Name and license number are required." });

    // Look up admin DB
    const adminNurse = await AdminNurse.findOne({
      name: { $regex: exactCaseInsensitive(strName) },
      licenseNumber: { $regex: exactCaseInsensitive(strLicense) },
    }).lean();

    if (!adminNurse) {
      // Fallback: allow existing local nurse accounts to log in if admin sync record is unavailable.
      const localNurse = await objUserData.findOne({
        name: { $regex: exactCaseInsensitive(strName) },
        licenseNumber: { $regex: exactCaseInsensitive(strLicense) },
      });

      if (localNurse) {
        const token = jwt.sign({ id: localNurse._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "8h" });
        console.log(`✅ Nurse login (local fallback): ${localNurse.name}`);
        return res.json({ status: objMessages.Success, message: objMessages.LoginSuccessfully, token, user: localNurse });
      }

      console.log(`❌ Nurse login blocked: "${strName}" / "${strLicense}" not found in admin or local nurse records.`);
      return res.status(403).json({ status: objMessages.Failure, message: "Nurse account not found. Ask the admin to register you first." });
    }

    // Create or update user record in voicebased_nurse
    const syncedFields = {
      adminNurseId:  String(adminNurse._id),
      name:          adminNurse.name,
      licenseNumber: adminNurse.licenseNumber,
      department:    adminNurse.department  || "",
      role:          adminNurse.role        || "",
      contactNumber: adminNurse.contactNumber || "",
      status:        adminNurse.status      || "Active",
    };

    let user = await objUserData.findOne({ adminNurseId: String(adminNurse._id) });
    if (!user) {
      user = await objUserData.create(syncedFields);
      console.log(`✅ Nurse account provisioned: ${user.name}`);
    } else {
      user.set(syncedFields);
      await user.save();
      console.log(`✅ Nurse login: ${user.name}`);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "default_secret", { expiresIn: "8h" });
    return res.json({ status: objMessages.Success, message: objMessages.LoginSuccessfully, token, user });
  } catch (error) {
    console.log("Error in serVerifyUser:", error);
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.SomethingWentWrong, error: error.message });
  }
};
//#endregion

//#region Get user _id from token
const serGetNurseIdFromToken = async (strToken, res) => {
  try {
    const token   = strToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    const user    = await objUserData.findById(decoded.id);
    if (!user)
      return res.status(objVariables.NotFound).json({ status: objMessages.Failure, message: objMessages.UserNotFoundOrIncorrectDetails });
    return user._id;
  } catch (error) {
    console.log(objMessages.ErrorFetchingUserProfile, error.message);
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.SomethingWentWrong, error: error.message });
  }
};
//#endregion

//#region Get nurse profile (returns synced admin data stored in user record)
const serGetUserProfile = async (userId, res) => {
  try {
    const user = await objUserData.findById(userId);
    if (!user)
      return res.status(objVariables.NotFound).json({ status: objMessages.Failure, message: objMessages.UserNotFoundOrIncorrectDetails });
    // Return with nurseName alias for backward-compat with NurseProfileScreen
    return {
      nurseName:     user.name,
      department:    user.department,
      role:          user.role,
      contactNumber: user.contactNumber,
      licenseNumber: user.licenseNumber,
      status:        user.status,
    };
  } catch (error) {
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.SomethingWentWrong, error: error.message });
  }
};
//#endregion

//#region Update nurse schedule
const serUpdateNurseSchedule = async (userId, schedules, res) => {
  try {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res.status(objVariables.BadRequest).json({
        status: objMessages.Failure,
        message: "Schedules must be a non-empty array.",
      });
    }

    const user = await objUserData.findById(userId);
    if (!user) {
      return res.status(objVariables.NotFound).json({
        status: objMessages.Failure,
        message: "Nurse not found.",
      });
    }

    user.schedules = schedules;
    await user.save();

    console.log(`✅ Schedule updated for nurse: ${user.name}`);
    return res.json({
      status: objMessages.Success,
      message: "Schedule updated successfully.",
    });
  } catch (error) {
    console.log("Error in serUpdateNurseSchedule:", error);
    return res.status(objVariables.ServerErrorCode).json({
      status: objMessages.Failure,
      message: objMessages.SomethingWentWrong,
      error: error.message,
    });
  }
};
//#endregion

//#region Get nurse schedule
const serGetNurseSchedule = async (userId, res) => {
  try {
    const user = await objUserData.findById(userId);
    if (!user) {
      return res.status(objVariables.NotFound).json({
        status: objMessages.Failure,
        message: "Nurse not found.",
      });
    }

    return user.schedules || [];
  } catch (error) {
    console.log("Error in serGetNurseSchedule:", error);
    return res.status(objVariables.ServerErrorCode).json({
      status: objMessages.Failure,
      message: objMessages.SomethingWentWrong,
      error: error.message,
    });
  }
};
//#endregion

module.exports = {
  serVerifyUser,
  serGetUserProfile,
  serGetNurseIdFromToken,
  serUpdateNurseSchedule,
  serGetNurseSchedule,
};