const AdminAlert = require('../models/SchAdminAlert');

const logAdminAlert = async ({
    entityType,
    entityId,
    action,
    title,
    description,
    severity = 'info',
    patientName = '',
    roomNo = '',
    userName = '',
    userRole = '',
    userDepartment = '',
}) => {
    try {
        await AdminAlert.create({
            entityType,
            entityId,
            action,
            title,
            description,
            severity,
            patientName,
            roomNo,
            userName,
            userRole,
            userDepartment,
        });
    } catch (error) {
        console.error('Failed to log admin alert:', error.message);
    }
};

module.exports = logAdminAlert;