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
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const MultipartychatUserSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    profileImage: { type: String },
    password: { type: String, required: [true, "Password Is Required"] },
    refreshToken: { type: String }
}, { timestamps: true });
MultipartychatUserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // this pre("save") means before getting save in the db
        // this function or method will run 
        try {
            console.log(this.password, 'this.password');
            if (!this.isModified("password"))
                return next();
            const saltRounds = 12;
            const salt = yield bcryptjs_1.default.genSalt(saltRounds);
            this.password = yield bcryptjs_1.default.hash(this.password, salt);
            next();
        }
        catch (err) {
            console.log(err);
        }
    });
});
MultipartychatUserSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("passwordParam", password);
            console.log("thisPasswordParam", this.password);
            return yield bcryptjs_1.default.compareSync(password, this.password);
        }
        catch (err) {
            console.log(err);
        }
    });
};
MultipartychatUserSchema.methods.generateAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accessTokenSecretKey = process.env.JWT_ACCESS_TOKEN_SECRETKEY;
            const accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY;
            return yield jsonwebtoken_1.default.sign({
                _id: this._id,
                email: this.email,
                userName: this.userName,
                fullName: this.fullName
            }, accessTokenSecretKey, { expiresIn: accessTokenExpiry });
        }
        catch (err) {
            console.log(err);
        }
    });
};
MultipartychatUserSchema.methods.generateRefreshToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const refreshTokenSecretKey = process.env.JWT_REFRESH_TOKEN_SECRETKEY;
            const refreshTokenExpiry = process.env.JWT_REFRESH_TOKEN_EXPIRY;
            return yield jsonwebtoken_1.default.sign({
                _id: this._id,
                email: this.email,
                userName: this.userName,
                fullName: this.fullName
            }, refreshTokenSecretKey, { expiresIn: refreshTokenExpiry });
        }
        catch (err) {
            console.log(err);
        }
    });
};
MultipartychatUserSchema.post("save", function (doc) {
    // this post("save") means after getting save in the db
    // this function or method will run 
    console.log("this ran after getting saved in the db", doc, 'documentation');
});
exports.default = (0, mongoose_1.model)("MultipartyChatUser", MultipartychatUserSchema);
