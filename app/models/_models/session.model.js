import mongoose from "mongoose";

const Session = mongoose.model(
  "Session",
  mongoose.Schema({
    sid: [String],
    userid: String,
  })
);

module.exports = Session;
