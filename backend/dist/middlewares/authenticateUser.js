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
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const reNewAcessToken_1 = __importDefault(require("../utils/reNewAcessToken"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const authenticateUser = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies[process.env.JWT_ACCESS_COOKIE_NAME];
        if (!accessToken) {
            yield (0, reNewAcessToken_1.default)(req, res, next);
        }
        else {
            const JWT_SECRETKEY = process.env.JWT_ACCESS_TOKEN_SECRETKEY;
            jsonwebtoken_1.default.verify(accessToken, JWT_SECRETKEY, (err, user) => {
                if (err) {
                    console.log(err);
                    throw new ApiError_1.default(401, "token used or InValid login again");
                }
                else {
                    req.user = user;
                    next();
                }
            });
        }
    }
    catch (error) {
    }
}));
exports.default = authenticateUser;
