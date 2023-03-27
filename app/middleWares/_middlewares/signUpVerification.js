import database from "../../models";

const User = database.user;
const ROLES = database.ROLES;

function isExistingEmailOrUsername (request, response, next) {
  User.findOne({
    username: request.body.username,
  }).exec((err, username) => {
    if (err) {
      response.status(500).send({ message: err });
      return;
    }
    if (username) {
      response.status(400).send({ message: "Username already exist!" });
      return;
    }

    User.findOne({
      email: request.body.email,
    }).exec((err, email) => {
      if (err) {
        response.status(500).send({ message: err });
        return;
      }
      if (email) {
        response.status(400).send({ message: "Email already exist!" });
        return;
      }

      next();
    });
  });
};

function isRolesExist(request, response, next) {
  if (request.body.roles) {
    for (let i = 0; i < request.body.roles.length; i++) {
      if (!ROLES.includes(request.body.roles[i])) {
        response.status(400).send({
          message: `Role ${request.body.roles[i]} does not exist`,
        });
        return;
      }
    }
  }

  next();
};

const signUpVerification = {
  isExistingEmailOrUsername,
  isRolesExist,
};

module.exports = signUpVerification;
