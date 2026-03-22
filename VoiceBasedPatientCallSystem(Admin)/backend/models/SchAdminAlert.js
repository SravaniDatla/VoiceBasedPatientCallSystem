const mongoose = require('mongoose');

const AdminAlertSchema = new mongoose.Schema(
    {
        entityType: {
            type: String,
            enum: ['Patient', 'Nurse'],
            required: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        action: {
            type: String,
            enum: ['created', 'updated', 'deleted'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info',
        },
        patientName: {
            type: String,
            default: '',
        },
        roomNo: {
            type: String,
            default: '',
        },
        userName: {
            type: String,
            default: '',
        },
        userRole: {
            type: String,
            default: '',
        },
        userDepartment: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('AdminAlert', AdminAlertSchema);