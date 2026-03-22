const mongoose = require("mongoose");

const samplePatient = {
  name: "Demo Patient",
  dob: "2000-01-01",
  requests: [],
};

async function seedDatabase(dbName) {
  const connection = await mongoose.createConnection(`mongodb://127.0.0.1:27017/${dbName}`).asPromise();

  try {
    const users = connection.db.collection("users");
    await users.updateOne(
      { name: samplePatient.name, dob: samplePatient.dob },
      { $setOnInsert: samplePatient },
      { upsert: true }
    );

    const record = await users.findOne(
      { name: samplePatient.name, dob: samplePatient.dob },
      { projection: { _id: 0, name: 1, dob: 1 } }
    );

    console.log(`${dbName}: ${JSON.stringify(record)}`);
  } finally {
    await connection.close();
  }
}

async function main() {
  for (const dbName of ["VoiceBasedPatientCare", "hospital"]) {
    await seedDatabase(dbName);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});