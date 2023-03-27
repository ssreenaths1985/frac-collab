import mongoose from "mongoose";

const FRACSession = mongoose.model(
  "FRACSession",
  mongoose.Schema({
    sid: [String],
    name: String,
    email: String,
    userid: String,
    room: String,
    timeStamp: Date,
  })
);

module.exports = FRACSession;
