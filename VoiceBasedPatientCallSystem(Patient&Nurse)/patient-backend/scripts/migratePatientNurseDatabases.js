const mongoose = require("mongoose");

async function copyCollections(fromUri, toUri, collections) {
  const from = await mongoose.createConnection(fromUri).asPromise();
  const to = await mongoose.createConnection(toUri).asPromise();

  try {
    for (const name of collections) {
      const exists = await from.db.listCollections({ name }).toArray();
      if (!exists.length) continue;

      const docs = await from.db.collection(name).find({}).toArray();
      if (!docs.length) continue;

      for (const doc of docs) {
        const copy = { ...doc };
        delete copy._id;
        await to.db.collection(name).updateOne(
          copy,
          { $setOnInsert: copy },
          { upsert: true }
        );
      }
    }
  } finally {
    await from.close();
    await to.close();
  }
}

async function printSummary(uri, label, countCollections) {
  const conn = await mongoose.createConnection(uri).asPromise();
  try {
    const collections = (await conn.db.listCollections().toArray())
      .map((c) => c.name)
      .sort();
    console.log(`${label}_COLLECTIONS`, collections);

    for (const collectionName of countCollections) {
      if (collections.includes(collectionName)) {
        const count = await conn.db.collection(collectionName).countDocuments();
        console.log(`${label}_${collectionName.toUpperCase()}_COUNT`, count);
      }
    }
  } finally {
    await conn.close();
  }
}

async function run() {
  // Patient DB target
  await copyCollections(
    "mongodb://127.0.0.1:27017/voicebased_admin",
    "mongodb://127.0.0.1:27017/voicebased_patient",
    ["users", "requests"]
  );
  await copyCollections(
    "mongodb://127.0.0.1:27017/VoiceBasedPatientCare",
    "mongodb://127.0.0.1:27017/voicebased_patient",
    ["users", "requests"]
  );

  // Nurse DB target
  await copyCollections(
    "mongodb://127.0.0.1:27017/hospital",
    "mongodb://127.0.0.1:27017/voicebased_nurse",
    [
      "users",
      "nurses",
      "patients",
      "patientdetails",
      "patientrequests",
      "nurseshifts",
      "taskdetails",
    ]
  );
  await copyCollections(
    "mongodb://127.0.0.1:27017/voicebased_admin",
    "mongodb://127.0.0.1:27017/voicebased_nurse",
    ["nurses", "patients", "patientrequests"]
  );

  await printSummary("mongodb://127.0.0.1:27017/voicebased_patient", "PATIENT_DB", [
    "users",
    "requests",
  ]);
  await printSummary("mongodb://127.0.0.1:27017/voicebased_nurse", "NURSE_DB", [
    "nurses",
    "patientrequests",
    "users",
  ]);
}

run().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
