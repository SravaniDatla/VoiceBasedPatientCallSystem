## Project Structure

- `VoiceBasedPatientCallSystem(Admin)/backend` - Admin API (Node.js + Express + MongoDB)
- `VoiceBasedPatientCallSystem(Admin)/frontend` - Admin dashboard UI (React)
- `VoiceBasedPatientCallSystem(Patient&Nurse)/patient-backend` - Patient API + NLP/voice helpers
- `VoiceBasedPatientCallSystem(Patient&Nurse)/nurse-backend` - Nurse API
- `VoiceBasedPatientCallSystem(Patient&Nurse)/voice-care-connect` - Expo app
- `scripts/` - Local MongoDB helper scripts (PowerShell)

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local instance on `127.0.0.1:27017` or MongoDB Atlas)
- For mobile flow: Expo Go app (optional)

## Databases

The project expects these databases:

- `voicebased_admin`
- `voicebased_patient`
- `voicebased_nurse`

Example local connection URIs:

- `mongodb://127.0.0.1:27017/voicebased_admin`
- `mongodb://127.0.0.1:27017/voicebased_patient`
- `mongodb://127.0.0.1:27017/voicebased_nurse`

## Environment Variables

Create `.env` files from `.env.sample` where available.

### Admin backend (`VoiceBasedPatientCallSystem(Admin)/backend/.env`)

```env
MONGODB_URI=mongodb://127.0.0.1:27017/voicebased_admin
PATIENT_MONGO_URI=mongodb://127.0.0.1:27017/voicebased_patient
NURSE_MONGO_URI=mongodb://127.0.0.1:27017/voicebased_nurse
PORT=5001
ALLOW_DELETE=false
```

### Patient backend (`VoiceBasedPatientCallSystem(Patient&Nurse)/patient-backend/.env`)

```env
MONGO_URI=mongodb://127.0.0.1:27017/voicebased_patient
ADMIN_MONGO_URI=mongodb://127.0.0.1:27017/voicebased_admin
JWT_SECRET=replace_this
PORT=5000
```

### Nurse backend (`VoiceBasedPatientCallSystem(Patient&Nurse)/nurse-backend/.env`)

```env
MONGO_URI=mongodb://127.0.0.1:27017/voicebased_nurse
PATIENT_MONGO_URI=mongodb://127.0.0.1:27017/voicebased_patient
ADMIN_MONGO_URI=mongodb://127.0.0.1:27017/voicebased_admin
JWT_SECRET=replace_this
PORT=4000
```

## Install Dependencies

Run once per module:

```powershell
cd "VoiceBasedPatientCallSystem(Admin)/backend"
npm install

cd "../frontend"
npm install

cd "../../VoiceBasedPatientCallSystem(Patient&Nurse)/patient-backend"
npm install

cd "../nurse-backend"
npm install

cd "../voice-care-connect"
npm install
```

## Start MongoDB

You can use your own MongoDB service, or use project scripts:

```powershell
cd scripts
./start-mongo.ps1
```

Optional checks:

```powershell
./check-project-db.ps1
./stop-mongo.ps1
```

## Run the Project (Development)

Open separate terminals for each service.

### 1) Admin backend (port 5001)

```powershell
cd "VoiceBasedPatientCallSystem(Admin)/backend"
node server.js
```

### 2) Admin frontend (port 3000)

```powershell
cd "VoiceBasedPatientCallSystem(Admin)/frontend"
npm start
```

### 3) Patient backend (port 5000)

```powershell
cd "VoiceBasedPatientCallSystem(Patient&Nurse)/patient-backend"
npm run dev
```

### 4) Nurse backend (port 4000)

```powershell
cd "VoiceBasedPatientCallSystem(Patient&Nurse)/nurse-backend"
node server.js
```

### 5) Voice Care Connect Expo app (port 8081)

```powershell
cd "VoiceBasedPatientCallSystem(Patient&Nurse)/voice-care-connect"
node ./node_modules/expo/bin/cli start
```

To run Expo in browser directly:

```powershell
node ./node_modules/expo/bin/cli start --web
```

## Access URLs

- Admin Login: `http://localhost:3000/login`
- Admin App Root: `http://localhost:3000`
- Admin API: `http://localhost:5001`
- Patient API: `http://localhost:5000`
- Nurse API: `http://localhost:4000`
- Expo Metro: `http://localhost:8081`

## Tech Stack

- Frontend: React, React Native, Expo
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
