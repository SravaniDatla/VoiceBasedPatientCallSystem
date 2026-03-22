
const express = require('express');
const router = express.Router();
const Patient = require('../models/SchPatient');
const logAdminAlert = require('../utils/logAdminAlert');
const {
    syncPatientToPatientDashboard,
    deletePatientFromPatientDashboard,
} = require('../utils/syncDashboardData');

router.get('/', async (req, res) => {
    try {
        const patients = await Patient.find().sort({ lastName: 1, firstName: 1 }); // Sort by last name, then first name
        res.json(patients);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/', async (req, res) => {
    const { firstName, lastName, dateOfBirth, contactNumber, email, gender, medicalHistory, roomNo } = req.body;

    try {
        const newPatient = new Patient({
            firstName,
            lastName,
            dateOfBirth,
            contactNumber,
            email,
            gender,
            medicalHistory,
            roomNo // You might not have roomNo at signup, consider making it optional or setting a default later
        });

        const patient = await newPatient.save();
        await syncPatientToPatientDashboard(patient);

        await logAdminAlert({
            entityType: 'Patient',
            entityId: patient._id,
            action: 'created',
            title: 'New patient added',
            description: `${patient.firstName} ${patient.lastName} was added to room ${patient.roomNo || 'unassigned'}.`,
            severity: 'success',
            patientName: `${patient.firstName} ${patient.lastName}`,
            roomNo: patient.roomNo || '',
            userName: `${patient.firstName} ${patient.lastName}`,
            userRole: 'Patient',
            userDepartment: patient.roomNo ? `Room ${patient.roomNo}` : '',
        });

        res.json(patient);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ msg: 'Patient not found' });
        }

        res.json(patient);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Patient not found' });
        }
        res.status(500).send('Server Error');
    }
});

router.put('/:id', async (req, res) => {
    const { firstName, lastName, dateOfBirth, contactNumber, email, gender, medicalHistory, condition, nurse, requestStatus, roomNo } = req.body;

    const patientFields = {};
    if (firstName) patientFields.firstName = firstName;
    if (lastName) patientFields.lastName = lastName;
    if (dateOfBirth) patientFields.dateOfBirth = dateOfBirth;
    if (contactNumber) patientFields.contactNumber = contactNumber;
    if (email) patientFields.email = email;
    if (gender) patientFields.gender = gender;
    if (medicalHistory) patientFields.medicalHistory = medicalHistory;
    if (condition) patientFields.condition = condition;
    if (nurse) patientFields.nurse = nurse; // Make sure to send the Nurse's ObjectId
    if (requestStatus) patientFields.requestStatus = requestStatus;
    if (roomNo) patientFields.roomNo = roomNo;

    try {
        let patient = await Patient.findById(req.params.id);

        if (!patient) {
            return res.status(404).json({ msg: 'Patient not found' });
        }

        patient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: patientFields },
            { new: true }
        );
        await syncPatientToPatientDashboard(patient);

        await logAdminAlert({
            entityType: 'Patient',
            entityId: patient._id,
            action: 'updated',
            title: 'Patient details updated',
            description: `${patient.firstName} ${patient.lastName} details were updated${patient.roomNo ? ` for room ${patient.roomNo}` : ''}.`,
            severity: patient.condition === 'Critical' ? 'warning' : 'info',
            patientName: `${patient.firstName} ${patient.lastName}`,
            roomNo: patient.roomNo || '',
            userName: `${patient.firstName} ${patient.lastName}`,
            userRole: 'Patient',
            userDepartment: patient.roomNo ? `Room ${patient.roomNo}` : '',
        });

        res.json(patient);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Patient not found' });
        }
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (process.env.ALLOW_DELETE !== 'true') {
            return res.status(403).json({ msg: 'Delete operations are disabled to protect stored data' });
        }

        const patient = await Patient.findByIdAndDelete(req.params.id);

        if (!patient) {
            return res.status(404).json({ msg: 'Patient not found' });
        }

        await logAdminAlert({
            entityType: 'Patient',
            entityId: patient._id,
            action: 'deleted',
            title: 'Patient removed',
            description: `${patient.firstName} ${patient.lastName} was removed from admin records.`,
            severity: 'error',
            patientName: `${patient.firstName} ${patient.lastName}`,
            roomNo: patient.roomNo || '',
            userName: `${patient.firstName} ${patient.lastName}`,
            userRole: 'Patient',
            userDepartment: patient.roomNo ? `Room ${patient.roomNo}` : '',
        });

        await deletePatientFromPatientDashboard(patient._id);

        res.json({ msg: 'Patient deleted' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Patient not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
