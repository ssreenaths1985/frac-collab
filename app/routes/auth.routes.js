import controller from "../controllers/auth.controller";
import { signUpVerification } from "../middleWares";

module.exports = (app) => {
  app.use((request, response, next) => {
    response.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/auth/signup", [
    signUpVerification.isExistingEmailOrUsername,
    signUpVerification.isRolesExist
  ], controller.signup);

  app.post("/api/auth/signin", controller.signin);
};
