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
exports.generateAccessAndRefreshToken = void 0;
const UserModel_1 = __importDefault(require("../models/UserModel"));
const ApiError_1 = __importDefault(require("./ApiError"));
const generateAccessAndRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel_1.default.findById(userId);
        console.log(user, 'user');
        const refreshToken = yield user.generateRefreshToken();
        const accessToken = yield user.generateAccessToken();
        user.refreshToken = refreshToken;
        yield user.save({ validateBeforeSave: false });
        return { refreshToken, accessToken };
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.code, err.message);
    }
});
exports.generateAccessAndRefreshToken = generateAccessAndRefreshToken;
