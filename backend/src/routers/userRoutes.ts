
import { Router } from "express";
import SignUp from "../controllers/userControllers/SignUp";
import { SignIn } from "../controllers/userControllers/SignIn";
import { upload } from "../middlewares/multer.middleware";
import CheckUserAuth from "../controllers/userControllers/CheckUserAuth";
import LogOut from "../controllers/userControllers/LogOut";
import authenticateUser from "../middlewares/authenticateUser";

const UserRouter: Router = Router();





UserRouter.get("/checkuserauthentication", CheckUserAuth);
UserRouter.post("/register", upload.single("profileImage"), SignUp);
UserRouter.post("/login", SignIn);
UserRouter.post("/logout", authenticateUser, LogOut);





export default UserRouter








