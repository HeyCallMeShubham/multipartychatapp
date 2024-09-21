"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncHandler_1 = __importDefault(require("../../utils/AsyncHandler"));
const UserModel_1 = __importDefault(require("../../models/UserModel"));
const ApiResponse_1 = require("../../utils/ApiResponse");
const LogOut = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield UserModel_1.default.
        findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } }, { new: true });
    ;
    const httpOnlyOptionsforRefreshToken = {
        httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
        secure: true,
        sameSite: "None"
    };
    const httpOnlyOptionsforAccessToken = {
        httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
        secure: true,
        sameSite: "None"
    };
    console.log(process.env.JWT_ACCESS_COOKIE_NAME, process.env.JWT_REFRESH_COOKIE_NAME, "dsewds");
    res
        .status(200)
        .clearCookie(process.env.JWT_ACCESS_COOKIE_NAME, httpOnlyOptionsforAccessToken)
        .clearCookie(process.env.JWT_REFRESH_COOKIE_NAME, httpOnlyOptionsforRefreshToken)
        .json(new ApiResponse_1.ApiResponse(200, { message: "logout_successful" }, "logout successful"));
}));
exports.default = LogOut;
