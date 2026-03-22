const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  requestText: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    default: "pending",
  },
  assignedNurseId: { type: String, default: "" },
  assignedNurseName: { type: String, default: "" },
});

module.exports = mongoose.model("Request", RequestSchema);
