
import { Router } from "express";
import SignUp from "../controllers/userControllers/SignUp";
import { SignIn } from "../controllers/userControllers/SignIn";
import { upload } from "../middlewares/multer.middleware";

const UserRouter: Router = Router();





UserRouter.post("/register", upload.single("profileImage"), SignUp);
UserRouter.post("/login", SignIn);





export default UserRouter








