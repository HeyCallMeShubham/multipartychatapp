"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const createCustomError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.message = message;
    return error;
};
const ErrorHandler = (statusCode, message) => {
    return createCustomError(statusCode, message);
};
exports.ErrorHandler = ErrorHandler;
