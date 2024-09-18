"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExpressAppAndHttpsServer = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const getCertOptions = () => {
    try {
        const key = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../../certs/cert.key"));
        const cert = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../../certs/cert.crt"));
        return { key, cert };
    }
    catch (err) {
        console.error("Error reading SSL certificate files:", err);
        return null;
    }
};
const httpOptions = getCertOptions();
if (!httpOptions) {
    throw new Error("Failed to load SSL certificate files. Server cannot start.");
}
const useExpressAppAndHttpsServer = () => {
    const httpsServer = https_1.default.createServer(httpOptions, app);
    const expressServer = httpsServer.listen(process.env.PORT || 4500, () => {
        console.log(`listening on port number ${process.env.PORT}`);
    });
    return { app, httpsServer, expressServer };
};
exports.useExpressAppAndHttpsServer = useExpressAppAndHttpsServer;
