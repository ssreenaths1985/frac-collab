import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const database = {};

database.mongoose = mongoose;
database.user = require("./_models/user.model");
database.role = require("./_models/role.model");
database.session = require("./_models/session.model");
database.fracSession = require("./_models/fracSession.model");
database.ROLES = ["editor", "commenter", "viewer"];

module.exports = database;