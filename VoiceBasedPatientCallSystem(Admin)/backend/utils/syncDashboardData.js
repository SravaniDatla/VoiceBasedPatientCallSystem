const mongoose = require('mongoose');

let patientConnection;
let nurseConnection;
let warningPrinted = false;

const getPatientConnection = async () => {
    const uri = process.env.PATIENT_MONGO_URI;
    if (!uri) {
        if (!warningPrinted) {
            console.warn('PATIENT_MONGO_URI is not set; patient dashboard sync is disabled.');
            warningPrinted = true;
        }
        return null;
    }

    if (!patientConnection) {
        patientConnection = mongoose.createConnection(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    await patientConnection.asPromise();
    return patientConnection;
};

const getNurseConnection = async () => {
    const uri = process.env.NURSE_MONGO_URI;
    if (!uri) {
        if (!warningPrinted) {
            console.warn('NURSE_MONGO_URI is not set; nurse dashboard sync is disabled.');
            warningPrinted = true;
        }
        return null;
    }

    if (!nurseConnection) {
        nurseConnection = mongoose.createConnection(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }

    await nurseConnection.asPromise();
    return nurseConnection;
};

const toDobString = (value) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }
    return parsed.toISOString().slice(0, 10);
};

const syncPatientToPatientDashboard = async (patientDoc) => {
    const connection = await getPatientConnection();
    if (!connection || !patientDoc) return;

    const patientUsers = connection.collection('users');
    const adminPatientId = String(patientDoc._id);
    const fullName = `${patientDoc.firstName || ''} ${patientDoc.lastName || ''}`.trim();

    await patientUsers.updateOne(
        { adminPatientId },
        {
            $set: {
                adminPatientId,
                name: fullName || 'Unknown',
                dob: toDobString(patientDoc.dateOfBirth),
                phone: patientDoc.contactNumber || '',
                email: patientDoc.email || '',
                gender: patientDoc.gender || '',
                roomNo: patientDoc.roomNo || '',
                medicalHistory: patientDoc.medicalHistory || '',
            },
            $setOnInsert: {
                requests: [],
            },
        },
        { upsert: true }
    );
};

const syncNurseToNurseDashboard = async (nurseDoc) => {
    const connection = await getNurseConnection();
    if (!connection || !nurseDoc) return;

    const nurseUsers = connection.collection('users');
    const adminNurseId = String(nurseDoc._id);

    await nurseUsers.updateOne(
        { adminNurseId },
        {
            $set: {
                adminNurseId,
                name: nurseDoc.name || 'Unknown',
                licenseNumber: nurseDoc.licenseNumber || '',
                department: nurseDoc.department || '',
                role: nurseDoc.role || '',
                contactNumber: nurseDoc.contactNumber || '',
                status: nurseDoc.status || 'Active',
            },
        },
        { upsert: true }
    );
};

const deletePatientFromPatientDashboard = async (patientId) => {
    const connection = await getPatientConnection();
    if (!connection || !patientId) return;

    await connection.collection('users').deleteOne({ adminPatientId: String(patientId) });
};

const deleteNurseFromNurseDashboard = async (nurseId) => {
    const connection = await getNurseConnection();
    if (!connection || !nurseId) return;

    await connection.collection('users').deleteOne({ adminNurseId: String(nurseId) });
};

module.exports = {
    syncPatientToPatientDashboard,
    syncNurseToNurseDashboard,
    deletePatientFromPatientDashboard,
    deleteNurseFromNurseDashboard,
};
