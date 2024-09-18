"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dotenvConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const dotenvConfig = () => {
    const result = dotenv_1.default.config({ path: path_1.default.resolve(__dirname, ".env") });
    if (result.error) {
        // Log the error and throw if the .env file is missing or there's another issue
        console.error("Failed to load .env file", result.error);
        throw result.error;
    }
    return result;
};
exports.dotenvConfig = dotenvConfig;
