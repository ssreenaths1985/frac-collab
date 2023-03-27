import { jwtAuthentication } from "../middleWares";
import controller from "../controllers/fracSession.controller";
import cors from "cors";

module.exports = (app) => {
  app.use((request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header(
      "Access-Control-Allow-Methods",
      "GET,PUT,POST,DELETE,OPTIONS"
    );
    response.header("Last-Modified", new Date().toUTCString());
    next();
  });

  app.options("*", cors());

  app.post(
    "/api/fracSession/create",
    cors(),
    [jwtAuthentication.tokenVerification],
    controller.addSessionMapping
  );

  app.post(
    "/api/fracSession/getAll",
    cors(),
    [jwtAuthentication.tokenVerification],
    controller.getSessionMapping
  );

  app.delete(
    "/api/fracSession/delete",
    cors(),
    [jwtAuthentication.tokenVerification],
    controller.deleteSessionById
  );
};
