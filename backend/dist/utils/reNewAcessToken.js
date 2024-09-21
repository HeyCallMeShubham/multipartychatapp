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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AsyncHandler_1 = __importDefault(require("./AsyncHandler"));
const ApiError_1 = __importDefault(require("./ApiError"));
const generateAccessAndRefreshToken_1 = require("./generateAccessAndRefreshToken");
const reNewAccessToken = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies[process.env.JWT_REFRESH_COOKIE_NAME];
        if (!refreshToken) {
            throw new ApiError_1.default(401, "you have no refresh token to access this resource pleae go and login again");
        }
        else {
            const secretKey = process.env.JWT_REFRESH_TOKEN_SECRETKEY;
            jsonwebtoken_1.default.verify(refreshToken, secretKey, (err, userData) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    throw new ApiError_1.default(401, "your token is invalid");
                }
                else {
                    ;
                    const httpOnlyOptionsforAccessToken = {
                        maxAge: 54000000,
                        httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
                        secure: true,
                        sameSite: "None"
                    };
                    const httpOnlyOptionsforRefreshToken = {
                        maxAge: 172800000,
                        httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
                        secure: true,
                        sameSite: "None"
                    };
                    const { userId, userName, email } = userData;
                    const { accessToken, refreshToken } = yield (0, generateAccessAndRefreshToken_1.generateAccessAndRefreshToken)(userId);
                    res.cookie(process.env.JWT_ACCESS_COOKIE_NAME, accessToken, httpOnlyOptionsforAccessToken);
                    res.cookie(process.env.JWT_REFRESH_COOKIE_NAME, refreshToken, httpOnlyOptionsforRefreshToken);
                    req.user = userData;
                    next();
                }
            }));
        }
    }
    catch (error) {
    }
}));
exports.default = reNewAccessToken;
