import { jwtAuthentication } from "../middleWares";
import controller from "../controllers/user.controller";

module.exports = (app) => {
  app.use((request, response, next) => {
    response.header(
      "Access-Control-Allow-Header",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/verify/all", controller.fullAccess);
  app.get(
    "/api/verify/viewer",
    [jwtAuthentication.tokenVerification],
    controller.viewerAccess
  );
  app.get(
    "/api/verify/editor",
    [jwtAuthentication.tokenVerification, jwtAuthentication.isEditor],
    controller.editorAccess
  );
  app.get(
    "/api/verify/commenter",
    [jwtAuthentication.tokenVerification, jwtAuthentication.isCommenter],
    controller.commenterAccess
  );
};
