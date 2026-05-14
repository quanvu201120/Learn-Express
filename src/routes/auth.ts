import express from "express";
import { createUser, LoginUser } from "../controllers/userController.js";
import { validateReqBody } from "../middlewares/validate.middleware.js";
import { loginBodyZod, registerBodyZod } from "../validations/auth.schema.js";

const routerAuth = express.Router();

routerAuth.post("/register", validateReqBody(registerBodyZod), createUser);
routerAuth.post("/login", validateReqBody(loginBodyZod), LoginUser);

export default routerAuth;
