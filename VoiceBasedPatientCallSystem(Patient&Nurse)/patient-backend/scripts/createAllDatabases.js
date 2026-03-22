const mongoose = require("mongoose");

const dbPlan = {
  VoiceBasedPatientCare: [
    "users",
    "requests",
    "patientdetails",
    "patientrequests",
    "nurseshifts",
    "nurses",
    "audiorequests",
  ],
  hospital: [
    "users",
    "patientdetails",
    "patientrequests",
    "nurseshifts",
    "nurses",
  ],
  voicebased_admin: [
    "patients",
    "nurses",
  ],
};

async function ensureCollection(connection, collectionName) {
  const exists = await connection.db
    .listCollections({ name: collectionName })
    .toArray();

  if (exists.length > 0) {
    return { collectionName, created: false };
  }

  await connection.db.createCollection(collectionName);
  return { collectionName, created: true };
}

async function ensureDatabase(dbName, collections) {
  const uri = `mongodb://127.0.0.1:27017/${dbName}`;
  const connection = await mongoose.createConnection(uri).asPromise();

  try {
    const results = [];
    for (const name of collections) {
      const result = await ensureCollection(connection, name);
      results.push(result);
    }
    return { dbName, results };
  } finally {
    await connection.close();
  }
}

async function main() {
  const summary = [];

  for (const [dbName, collections] of Object.entries(dbPlan)) {
    const dbResult = await ensureDatabase(dbName, collections);
    summary.push(dbResult);
  }

  for (const dbResult of summary) {
    console.log(`\nDatabase: ${dbResult.dbName}`);
    for (const item of dbResult.results) {
      const status = item.created ? "created" : "exists";
      console.log(` - ${item.collectionName}: ${status}`);
    }
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
