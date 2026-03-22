const express = require('express');
const router = express.Router();
const Nurse = require('../models/SchNurse');
const Patient = require('../models/SchPatient');
const AdminAlert = require('../models/SchAdminAlert');

const buildDateRange = (dateValue) => {
    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    return { startOfDay, endOfDay };
};

router.get('/summary', async (req, res) => {
    try {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const [totalNurses, totalPatients, alertsToday, recentAlerts] = await Promise.all([
            Nurse.countDocuments(),
            Patient.countDocuments(),
            AdminAlert.countDocuments({ createdAt: { $gte: startOfToday } }),
            AdminAlert.find().sort({ createdAt: -1 }).limit(5),
        ]);

        res.json({
            totalNurses,
            totalPatients,
            alertsToday,
            recentAlerts,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/alerts', async (req, res) => {
    try {
        const { date } = req.query;
        const query = {};

        if (date) {
            const range = buildDateRange(date);

            if (!range) {
                return res.status(400).json({ message: 'Invalid date query.' });
            }

            query.createdAt = {
                $gte: range.startOfDay,
                $lte: range.endOfDay,
            };
        }

        const alerts = await AdminAlert.find(query).sort({ createdAt: -1 });
        res.json(alerts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/statistics', async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const alerts = await AdminAlert.find({ createdAt: { $gte: startDate } }).sort({ createdAt: 1 });
        const labels = [];
        const countsByDay = new Map();

        for (let offset = 0; offset < 7; offset += 1) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + offset);
            const label = day.toLocaleDateString('en-US', { weekday: 'long' });
            const key = day.toISOString().slice(0, 10);
            labels.push({ key, label });
            countsByDay.set(key, 0);
        }

        alerts.forEach((alert) => {
            const key = new Date(alert.createdAt).toISOString().slice(0, 10);
            if (countsByDay.has(key)) {
                countsByDay.set(key, countsByDay.get(key) + 1);
            }
        });

        res.json(
            labels.map(({ key, label }) => ({
                date: label,
                value: countsByDay.get(key) || 0,
            }))
        );
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;