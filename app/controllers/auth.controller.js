import configurations from "../configurations/auth.config";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import database from "../models";

const Role = database.role;
const User = database.user;

exports.signup = (request, response) => {
  const user = User({
    username: request.body.username,
    email: request.body.email,
    password: bcrypt.hashSync(request.body.password, 8),
  });

  user.save((err, user) => {
    if (err) {
      response.status(500).send({ message: err });
      return;
    }

    if (request.body.roles) {
      Role.find({ name: { $in: request.body.roles } }, (err, roles) => {
        if (err) {
          response.status(500).send({ message: err });
          return;
        }

        user.roles = roles.map(i => i._id);
        user.save((err) => {
          if (err) {
            response.status(500).send({ message: err });
            return;
          }

          response.send({ message: "User registered!" });
        });
      });
    } else {
      Role.findOne({ name: "viewer" }, (err, role) => {
        if (err) {
          response.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            response.status(500).send({ message: err });
            return;
          }

          response.send({ message: "User registered!" });
        });
      });
    }
  });
};

exports.signin = (request, response) => {
  User.findOne({
    username: request.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        response.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return response.status(404).send({ message: "User not found!" });
      }

      let isValidPassword = bcrypt.compareSync(
        request.body.password,
        user.password
      );

      if (!isValidPassword) {
        return response.status(401).send({
          accessToken: null,
          message: "Password is invalid!",
        });
      }

      let tkn = jwt.sign({ id: user.id }, configurations.secret, {
        expiresIn: 86400,
      });

      let authorization = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorization.push(user.roles[i].name.toUpperCase());
      }

      response.status(200).json({
        id: user._id,
        accessToken: tkn,
        username: user.username,
        email: user.email,
        roles: authorization,
      });
    });
};
