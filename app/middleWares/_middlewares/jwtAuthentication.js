import config from "../../configurations/auth.config";
import database from "../../models";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";
import "../../../config";

const Role = database.role;
const User = database.user;

const kcUrl = global.env.APP_COLLAB_KEYCLOAK_URL;
const kcrealmName = "sunbird";

function tokenVerification(request, response, next) {
  // let tkn = request.headers["x-access-token"];
  let tkn = request.headers["authorization"];

  if (!tkn) {
    return response.status(403).send({ message: "Token not found" });
  }

  fetch(
    `https://${kcUrl}/realms/${kcrealmName}/protocol/openid-connect/userinfo`,
    {
      method: "GET",
      headers: { Authorization: tkn },
    }
  ).then((res) => {
    if (res.status == 200) {
      next();
    } else {
      response
        .status(401)
        .json({ statusCode: 403, message: "Unauthorized token" });
    }
  });

  // jwt.verify(tkn, config.secret, (err, decode) => {
  //   if (err) {
  //     return response.status(401).send({ message: "Unauthorized token" });
  //   }
  //   request.userId = decode.id;
  //   next();
  // });
}

function isEditor(request, response, next) {
  User.findById(request.userId).exec((err, user) => {
    if (err) {
      response.status(500).send({ message: err });
      return;
    }

    Role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        response.status(500).send({ message: err });
        return;
      }

      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "editor") {
          next();
          return;
        }
      }
      response.status(403).send({ message: "Editor role is needed" });
      return;
    });
  });
}

function isCommenter(request, response, next) {
  User.findById(request.userId).exec((err, user) => {
    if (err) {
      response.status(500).send({ message: err });
      return;
    }

    Role.find({ _id: { $in: user.roles } }, (err, roles) => {
      if (err) {
        response.status(500).send({ message: err });
        return;
      }

      for (let i = 0; i < roles.length; i++) {
        if (roles[i].name === "commenter") {
          next();
          return;
        }
      }
      response.status(403).send({ message: "Commenter role is needed" });
      return;
    });
  });
}

const jwtAuthentication = {
  tokenVerification,
  isEditor,
  isCommenter,
};

module.exports = jwtAuthentication;
