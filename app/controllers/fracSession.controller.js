import database from "../models";

const FRACSession = database.fracSession;

// Map session
exports.addSessionMapping = (request, response) => {
  const session = FRACSession({
    sid: request.body.sid,
    name: request.body.username,
    email: request.body.email,
    userid: request.body.userid,
    room: request.body.room,
    timeStamp: new Date(),
  });

  FRACSession.updateMany(
    { userid: session.userid },
    {
      $addToSet: { sid: session.sid },
      $set: {
        userid: session.userid,
        name: session.name,
        email: session.email,
        room: session.room,
        timeStamp: session.timeStamp
      },
    },
    { safe: true, upsert: true },
    (err, result) => {
      if (err) {
        response.status(500).send({ message: err });
        return;
      }
      response
        .status(200)
        .send({ statusCode: 200, message: "Mapped session!" });
    }
  );
};

// Get all mapped sessions
exports.getSessionMapping = (request, response) => {
  FRACSession.find()
    .then((sessionMappings) => {
      response.status(200).json(sessionMappings);
    })
    .catch((err) => {
      response.status(500).send({
        message: err,
      });
    });
};

// Delete session
exports.deleteSessionById = (request, response) => {
  FRACSession.findByIdAndRemove(request.body._id)
    .then((deleteSession) => {
      if (!deleteSession) {
        return response.status(404).send({
          message: "Session id not found!",
        });
      }
      response.status(200).send({ message: "Session deleted successfully!" });
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
