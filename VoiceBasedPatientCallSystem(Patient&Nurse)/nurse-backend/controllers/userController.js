const express = require("express");
const router = express.Router();
const app = express();

app.use(express.json());

const userService = require('../services/userServices');
const objVariables = require('../common/variables');
const objMessages = require('../common/messages');


//#region Verify user (admin-gated: name + licenseNumber)
const verifyUser = async (req, res) => {
  try {
    const { name, licenseNumber } = req.body;
    await userService.serVerifyUser(name, licenseNumber, res);
  } catch (error) {
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.InternalServerError, error: error.message });
  }
};
//#endregion

//#region Get Nurse Profile Details
const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res.status(401).json({ status: objMessages.Failure, message: objMessages.TokenIsMandatory });
    const userId     = await userService.serGetNurseIdFromToken(token);
    const userProfile = await userService.serGetUserProfile(userId, res);
    return res.json(userProfile);
  } catch (error) {
    console.log(objMessages.ErrorFetchingUserProfile, error.message);
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.InternalServerError, error: error.message });
  }
};
//#endregion

//#region Update Nurse Schedule
const updateNurseSchedule = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res.status(401).json({ status: objMessages.Failure, message: objMessages.TokenIsMandatory });
    
    const userId = await userService.serGetNurseIdFromToken(token);
    const { schedules } = req.body;
    
    await userService.serUpdateNurseSchedule(userId, schedules, res);
  } catch (error) {
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.InternalServerError, error: error.message });
  }
};
//#endregion

//#region Get Nurse Schedule
const getNurseSchedule = async (req, res) => {
  try {
    const token = req.headers.authorization;
    if (!token)
      return res.status(401).json({ status: objMessages.Failure, message: objMessages.TokenIsMandatory });
    
    const userId = await userService.serGetNurseIdFromToken(token);
    const schedules = await userService.serGetNurseSchedule(userId, res);
    return res.json({ status: objMessages.Success, schedules });
  } catch (error) {
    return res.status(objVariables.ServerErrorCode).json({ status: objMessages.Failure, message: objMessages.InternalServerError, error: error.message });
  }
};
//#endregion

module.exports = {
  verifyUser,
  getUserProfile,
  updateNurseSchedule,
  getNurseSchedule,
};