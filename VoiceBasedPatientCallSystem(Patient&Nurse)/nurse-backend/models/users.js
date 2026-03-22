const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  shiftType: { type: String, default: "Morning" }, // Morning, Afternoon, Night
  startTime: { type: String, default: "" }, // HH:MM format (e.g., "09:00")
  endTime:   { type: String, default: "" }, // HH:MM format (e.g., "17:00")
  dayOfWeek: { type: String, default: "" }, // Monday, Tuesday, etc.
  date: { type: String, default: "" },
  location: { type: String, default: "" },
  facility: { type: String, default: "" },
  notes: { type: String, default: "" },
  status: { type: String, enum: ["pending", "confirmed", "completed"], default: "pending" },
});

const UserSchema = new mongoose.Schema({
  adminNurseId: { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  licenseNumber:{ type: String, required: true },
  department:   { type: String, default: "" },
  role:         { type: String, default: "" },
  contactNumber:{ type: String, default: "" },
  status:       { type: String, default: "Active" },
  schedules:    [scheduleSchema], // Array of schedules
});

module.exports = mongoose.model("users", UserSchema);


