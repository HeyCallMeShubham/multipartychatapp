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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignIn = void 0;
const UserModel_1 = __importDefault(require("../../models/UserModel"));
const AsyncHandler_1 = __importDefault(require("../../utils/AsyncHandler"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const generateAccessAndRefreshToken_1 = require("../../utils/generateAccessAndRefreshToken");
const ApiResponse_1 = require("../../utils/ApiResponse");
const SignIn = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email: clientEmail, password: clientPassword } = req.body;
    console.log(req.body, 'req.body');
    try {
        const user = yield UserModel_1.default.findOne({ email: clientEmail });
        if (!user) {
            throw new ApiError_1.default(404, "no user with email id exist");
        }
        const isPasswordValid = yield user.isPasswordCorrect(clientPassword);
        if (!isPasswordValid) {
            throw new ApiError_1.default(401, "Invalid User Credentials");
        }
        const { refreshToken: userRefreshToken, accessToken: userAccessToken } = yield (0, generateAccessAndRefreshToken_1.generateAccessAndRefreshToken)(user.id);
        ;
        const httpOnlyOptionsforRefreshToken = {
            maxAge: 172800000,
            httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
            secure: true,
        };
        const httpOnlyOptionsforAccessToken = {
            maxAge: 54000000,
            httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
            secure: true,
        };
        res.cookie("multipartychatrefreshtoken", userRefreshToken, httpOnlyOptionsforRefreshToken);
        res.cookie("multipartychataccesstoken", userAccessToken, httpOnlyOptionsforAccessToken);
        const _a = user._doc, { password, refreshToken, createdAt, updatedAt } = _a, rest = __rest(_a, ["password", "refreshToken", "createdAt", "updatedAt"]);
        return res.status(200).json(new ApiResponse_1.ApiResponse(201, rest, "Logged In Successfully"));
    }
    catch (error) {
        throw new ApiError_1.default(error.code, (error === null || error === void 0 ? void 0 : error.message) || "something went wrong");
    }
}));
exports.SignIn = SignIn;
