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
const reNewAccessToken = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.multipartyChatRefreshToken;
    if (!refreshToken) {
        throw new ApiError_1.default(401, "you have no refresh token to access this resource pleae go and login again");
    }
    else {
        const secretKey = process.env.JWT_SECRETKEY;
        jsonwebtoken_1.default.verify(refreshToken, secretKey, (err, decodedData) => {
            if (err) {
                throw new ApiError_1.default(401, "your token is invalid");
            }
            else {
                ;
                const httpOnlyOptionsforAccessToken = {
                    maxAge: 54000000,
                    httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
                    secure: true
                };
                const { userId, userName, email } = decodedData;
                const accesssToken = jsonwebtoken_1.default.sign({ email: email, userId: userId }, secretKey);
                res.cookie("multipartyChatAccessToken", accesssToken, httpOnlyOptionsforAccessToken);
                next();
            }
        });
    }
}));
exports.default = reNewAccessToken;
