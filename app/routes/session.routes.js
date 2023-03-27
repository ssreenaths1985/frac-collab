// import { jwtAuthentication } from "../middleWares";
import controller from "../controllers/session.controller";

module.exports = (app) => {
  app.use((request, response, next) => {
    response.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/session/create", controller.addSessionMapping);

  app.get("/api/session/getAll", controller.getSessionMapping);

  app.delete("/api/session/delete", controller.deleteSessionById);

  app.get("/api/session/userDetails/:userId", controller.getUserDetailsById);
};
