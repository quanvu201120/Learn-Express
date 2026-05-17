import express from "express";
import {
    createUser,
    GetUser,
    LoginUser,
    LogoutUser,
    RefreshToken,
} from "../controllers/userController.js";
import { validateReqBody } from "../middlewares/validate.middleware.js";
import { loginBodyZod, registerBodyZod } from "../validations/auth.schema.js";

const routerAuth = express.Router();

routerAuth.post("/register", validateReqBody(registerBodyZod), createUser);
routerAuth.post("/login", validateReqBody(loginBodyZod), LoginUser);
routerAuth.get("/users", GetUser);
routerAuth.post("/admin", (req, res) => {
    res.json({
        message: "Hello admin",
        data: null,
    });
});
routerAuth.post("/logout", LogoutUser);
routerAuth.post("/refreshToken", RefreshToken);

export default routerAuth;
