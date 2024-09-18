"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExpressApp = void 0;
const express_1 = __importDefault(require("express"));
const useExpressApp = () => {
    const app = (0, express_1.default)();
    const expressServer = app.listen((process.env.PORT), () => {
        console.log(`listening on port ${process.env.PORT}`);
    });
    return { app, expressServer };
};
exports.useExpressApp = useExpressApp;
