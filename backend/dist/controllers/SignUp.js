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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserModel_1 = __importDefault(require("../models/UserModel"));
const AsyncHandler_1 = __importDefault(require("../utils/AsyncHandler"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const ApiResponse_1 = require("../utils/ApiResponse");
const SignUp = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, userName, email, password, } = req.body;
    try {
        const emailExist = yield UserModel_1.default.findOne({ email });
        if (emailExist) {
            throw new ApiError_1.default(409, "user with this email already exists");
        }
        else {
            const saltRounds = 12;
            const salt = yield bcryptjs_1.default.genSalt(saltRounds);
            const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
            const user = new UserModel_1.default({
                userName,
                fullName,
                email,
                password: hashedPassword
            });
            if (user) {
                const createdUser = yield user.save();
                if (createdUser) {
                    res.status(201).json(new ApiResponse_1.ApiResponse(201, {}, "user created Successfully"));
                }
                else {
                    throw new ApiError_1.default(500, "Internal server error Couldnt create Account try again later");
                }
            }
        }
    }
    catch (error) {
        throw new ApiError_1.default(401, (error === null || error === void 0 ? void 0 : error.message) || "something went wrong");
    }
}));
exports.default = SignUp;
