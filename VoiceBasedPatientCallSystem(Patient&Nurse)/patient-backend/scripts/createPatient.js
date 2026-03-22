const mongoose = require("mongoose");
const User = require("../models/User");

function normalizeDob(input) {
  const value = String(input || "").trim();
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!valid) {
    return null;
  }
  return value;
}

async function main() {
  const rawName = process.argv[2];
  const rawDob = process.argv[3];

  const name = String(rawName || "").trim();
  const dob = normalizeDob(rawDob);

  if (!name || !dob) {
    console.error("Usage: node scripts/createPatient.js \"Patient Name\" YYYY-MM-DD");
    process.exit(1);
  }

  await mongoose.connect("mongodb://127.0.0.1:27017/VoiceBasedPatientCare");

  try {
    const existing = await User.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      dob,
    });

    if (existing) {
      console.log("Patient already exists:", JSON.stringify({ name: existing.name, dob: existing.dob }));
      return;
    }

    const created = await User.create({ name, dob, requests: [] });
    console.log("Patient created:", JSON.stringify({ id: created._id, name: created.name, dob: created.dob }));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
