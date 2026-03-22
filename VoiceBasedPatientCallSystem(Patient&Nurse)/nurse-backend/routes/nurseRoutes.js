const express = require("express");
const userController = require("../controllers/userController");
const nurseController = require("../controllers/nurseActivitiesController");

const router = express.Router();

router.post("/user/verifyUser",userController.verifyUser);
router.get("/user/getUserProfile",userController.getUserProfile);
router.get("/user/getNurseSchedule", userController.getNurseSchedule);
router.put("/user/updateNurseSchedule", userController.updateNurseSchedule);
router.get("/nurse/getPatientRequests", nurseController.getPatientRequests);
router.get("/nurse/getHospitalPatients", nurseController.getHospitalPatients);
router.put("/nurse/updatePatientRequests", nurseController.updatePatientRequestStatus);
router.put("/nurse/assignPatientRequest", nurseController.assignPatientRequest);
router.post("/nurse/createPatientRequests", nurseController.createPatientRequest);

module.exports = router;