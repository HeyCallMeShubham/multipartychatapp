"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SignUp_1 = __importDefault(require("../controllers/userControllers/SignUp"));
const SignIn_1 = require("../controllers/userControllers/SignIn");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const CheckUserAuth_1 = __importDefault(require("../controllers/userControllers/CheckUserAuth"));
const LogOut_1 = __importDefault(require("../controllers/userControllers/LogOut"));
const authenticateUser_1 = __importDefault(require("../middlewares/authenticateUser"));
const UserRouter = (0, express_1.Router)();
UserRouter.get("/checkuserauthentication", CheckUserAuth_1.default);
UserRouter.post("/register", multer_middleware_1.upload.single("profileImage"), SignUp_1.default);
UserRouter.post("/login", SignIn_1.SignIn);
UserRouter.post("/logout", authenticateUser_1.default, LogOut_1.default);
exports.default = UserRouter;
