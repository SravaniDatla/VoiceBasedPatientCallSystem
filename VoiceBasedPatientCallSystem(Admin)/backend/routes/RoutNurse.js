
const express = require('express');
const router = express.Router();
const Nurse = require('../models/SchNurse');
const logAdminAlert = require('../utils/logAdminAlert');
const {
    syncNurseToNurseDashboard,
    deleteNurseFromNurseDashboard,
} = require('../utils/syncDashboardData');


router.get('/', async (req, res) => {
    try {
        const nurses = await Nurse.find().sort({ name: 1 }); 
        res.json(nurses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


router.post('/', async (req, res) => {
    const { name, department, role, contactNumber, licenseNumber } = req.body;

    try {
        const newNurse = new Nurse({
            name,
            department,
            role,
            contactNumber,
            licenseNumber
        });

        const nurse = await newNurse.save();
        await syncNurseToNurseDashboard(nurse);

        await logAdminAlert({
            entityType: 'Nurse',
            entityId: nurse._id,
            action: 'created',
            title: 'New nurse added',
            description: `${nurse.name} joined the ${nurse.department} department as ${nurse.role}.`,
            severity: 'success',
            userName: nurse.name || '',
            userRole: nurse.role || 'Nurse',
            userDepartment: nurse.department || '',
        });

        res.json(nurse);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'License number already exists' });
        }
        res.status(500).send('Server Error');
    }
});

router.get('/:id', async (req, res) => {
    try {
        const nurse = await Nurse.findById(req.params.id);

        if (!nurse) {
            return res.status(404).json({ msg: 'Nurse not found' });
        }

        res.json(nurse);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Nurse not found' });
        }
        res.status(500).send('Server Error');
    }
});

router.put('/:id', async (req, res) => {
    const { name, department, role, contactNumber, licenseNumber } = req.body;

    const nurseFields = {};
    if (name) nurseFields.name = name;
    if (department) nurseFields.department = department;
    if (role) nurseFields.role = role;
    if (contactNumber) nurseFields.contactNumber = contactNumber;
    if (licenseNumber) nurseFields.licenseNumber = licenseNumber;

    try {
        let nurse = await Nurse.findById(req.params.id);

        if (!nurse) {
            return res.status(404).json({ msg: 'Nurse not found' });
        }

        nurse = await Nurse.findByIdAndUpdate(
            req.params.id,
            { $set: nurseFields },
            { new: true }
        );
        await syncNurseToNurseDashboard(nurse);

        await logAdminAlert({
            entityType: 'Nurse',
            entityId: nurse._id,
            action: 'updated',
            title: 'Nurse details updated',
            description: `${nurse.name}'s profile was updated in the ${nurse.department} department.`,
            severity: nurse.status === 'Active' ? 'info' : 'warning',
            userName: nurse.name || '',
            userRole: nurse.role || 'Nurse',
            userDepartment: nurse.department || '',
        });

        res.json(nurse);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Nurse not found' });
        }
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'License number already exists' });
        }
        res.status(500).send('Server Error');
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (process.env.ALLOW_DELETE !== 'true') {
            return res.status(403).json({ msg: 'Delete operations are disabled to protect stored data' });
        }

        const nurse = await Nurse.findByIdAndDelete(req.params.id);

        if (!nurse) {
            return res.status(404).json({ msg: 'Nurse not found' });
        }

        await logAdminAlert({
            entityType: 'Nurse',
            entityId: nurse._id,
            action: 'deleted',
            title: 'Nurse removed',
            description: `${nurse.name} was removed from admin records.`,
            severity: 'error',
            userName: nurse.name || '',
            userRole: nurse.role || 'Nurse',
            userDepartment: nurse.department || '',
        });

        await deleteNurseFromNurseDashboard(nurse._id);

        res.json({ msg: 'Nurse deleted' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Nurse not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;