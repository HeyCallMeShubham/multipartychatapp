"use strict";
class CustomErrorHandler extends Error {
    constructor(statusCode, message, stack) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
    }
}
