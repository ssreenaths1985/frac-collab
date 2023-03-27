import mongoose from "mongoose";

const Role = mongoose.model(
    "Role",
    mongoose.Schema({
        name: String
    })
);

module.exports = Role;