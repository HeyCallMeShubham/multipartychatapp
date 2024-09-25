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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../../utils/ApiError"));
const ApiResponse_1 = require("../../utils/ApiResponse");
const CheckUserAuth = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refreshToken = req.cookies[process.env.JWT_REFRESH_COOKIE_NAME];
        if (!refreshToken) {
            throw new ApiError_1.default(404, "no refresh token found either expired or not available please login again");
        }
        const refreshTokenSecretKey = process.env.JWT_REFRESH_TOKEN_SECRETKEY;
        const isTokenVerified = jsonwebtoken_1.default.verify(refreshToken, refreshTokenSecretKey);
        if (isTokenVerified) {
            return res.status(200).json(new ApiResponse_1.ApiResponse(200, { isValid: true }, "validToken"));
        }
        else {
            throw new ApiError_1.default(400, "inValidToken");
        }
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.code, err.message);
    }
}));
exports.default = CheckUserAuth;
