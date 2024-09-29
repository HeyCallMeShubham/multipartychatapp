"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSocket = void 0;
const socket_io_1 = require("socket.io");
const useExpressAndHttpsServer_1 = require("./useExpressAndHttpsServer");
const { httpsServer } = (0, useExpressAndHttpsServer_1.useExpressAppAndHttpsServer)();
const useSocket = () => {
    const io = new socket_io_1.Server(httpsServer, {
        cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"]
        },
        serveClient: true,
        allowRequest: (req, callback) => {
            callback(null, true);
        },
    });
    io.listen(8700);
    return io;
};
exports.useSocket = useSocket;
