import configurations from "../configurations/auth.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import database from "../models";

const Session = database.session;
const User = database.user;

exports.addSessionMapping = (request, response) => {
  const session = Session({
    sid: request.body.sid,
    userid: request.body.userid,
  });

  Session.findByIdAndUpdate(
    session.userid,
    { $addToSet: { sid: session.sid }, $set: { userid: session.userid } },
    { safe: true, upsert: true },
    (err, result) => {
      if (err) {
        response.status(500).send({ message: err });
        return;
      }
      response.send({ message: "Mapped session!" });
    }
  );
};

exports.getSessionMapping = (request, response) => {
  Session.find()
    .then((sessionMappings) => {
      response.json(sessionMappings);
    })
    .catch((err) => {
      response.status(500).send({
        message: err,
      });
    });
};

exports.deleteSessionById = (request, response) => {
  Session.findByIdAndRemove(request.body._id)
    .then((deleteSession) => {
      if (!deleteSession) {
        return response.status(404).send({
          message: "Session id not found!",
        });
      }
      response.send({ message: "Session deleted successfully!" });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return response
          .status(404)
          .send({ message: "Session id not found! Err" });
      }

      return response.status(500).send({
        message: "Could not delete this session!",
      });
    });
};

exports.getUserDetailsById = (request, response) => {
  User.findById(request.params.userId)
    .then((details) => {
      if (!details) {
        return response.status(404).send({
          message: "Userid not found!",
        });
      }
      response.json({
        _id: details._id,
        email: details.email,
        username: details.username,
      });
    })
    .catch((err) => {
      if (err.kind === "ObjectId" || err.name === "NotFound") {
        return response.status(404).send({ message: "User id not found! Err" });
      }
      return response.status(500).send({
        message: "Could not retrieve this user details!",
      });
    });
};
