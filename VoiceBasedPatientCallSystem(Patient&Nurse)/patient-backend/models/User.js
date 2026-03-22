const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  adminPatientId: { type: String },
  name: { type: String, required: true },
  dob: { type: String, required: true },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  gender: { type: String, default: "" },
  roomNo: { type: String, default: "" },
  medicalHistory: { type: String, default: "" },
  requests: [{ text: String, time: String }],
});

module.exports = mongoose.model("User", UserSchema);
