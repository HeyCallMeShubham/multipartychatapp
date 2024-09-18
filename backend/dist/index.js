"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.uploadOnCloudinary = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routers/userRoutes"));
const dbConnect_1 = require("./config/dbConnect");
const roomRoutes_1 = require("./routers/roomRoutes");
const useExpressAndHttpsServer_1 = require("./utils/useExpressAndHttpsServer");
const useSocket_1 = require("./utils/useSocket");
const fs_1 = __importDefault(require("fs"));
const mediasoup = __importStar(require("mediasoup"));
const mediasoup_1 = require("mediasoup");
const ApiError_1 = __importDefault(require("./utils/ApiError"));
const RoomModel_1 = __importDefault(require("./models/RoomModel"));
const dotenvConfig_1 = require("./dotenvConfig");
const cloudinary_1 = require("cloudinary");
(0, dotenvConfig_1.dotenvConfig)();
const { createWorker, } = mediasoup;
const { Worker, Router, Transport, Producer, Consumer } = mediasoup_1.types;
const { app, httpsServer, expressServer } = (0, useExpressAndHttpsServer_1.useExpressAppAndHttpsServer)();
(0, dbConnect_1.connectDb)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(body_parser_1.default.json({ limit: "50mb" }));
app.use((0, cookie_parser_1.default)());
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/room", roomRoutes_1.roomRouter);
app.use(body_parser_1.default.urlencoded({ limit: "50mb", extended: true }));
app.use(express_1.default.static("public"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadOnCloudinary = (localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!localFilePath)
            return null;
        const uploadedFile = yield cloudinary_1.v2.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        fs_1.default.unlinkSync(localFilePath);
        return uploadedFile;
    }
    catch (err) {
        fs_1.default.unlinkSync(localFilePath);
        throw new ApiError_1.default(400, err.message);
    }
});
exports.uploadOnCloudinary = uploadOnCloudinary;
const mediaCodecs = [
    {
        kind: "audio",
        mimeType: "audio/opus",
        clockRate: 48000,
        channels: 2
    },
    {
        kind: "video",
        mimeType: "video/VP8",
        clockRate: 90000,
        parameters: {
            "x-google-start-bitrate": 1000
        }
    },
];
let worker;
const activeRooms = new Map(); // this activeRooms object will store router and roomMembers array associated with a specific room  
const emailToSocket = new Map(); // this will have socket stored and identifier of it will be email
const socketToEmail = new Map(); // this will have email stored and identifier of it will be user socketId
const activeUsers = new Map(); /// this object will have activeUser object that includes email socket, transportId's etc 
const roomProducers = new Map([]); /// this array will have all the Producers of a room 
const transports = new Map(); /// this will have transports or users stored that we will identify by transport id of that specific transport 
const producers = new Map(); /// this will have producers or users stored that we will identify by producer id of that specific producer 
const consumers = new Map(); /// this will have consumers or users stored that we will identify by consumer id of that specific consumer 
const sockets = new Map(); // this will have stored entire socket object of and active user based upon socket id  
const createWorkerFunction = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        worker = yield createWorker({
            rtcMinPort: 4000,
            rtcMaxPort: 5250
        });
        worker.on("died", (error) => {
            setTimeout(() => {
                process.exit(1);
            }, 2000);
        });
        return worker;
    }
    catch (err) {
        throw new Error(err.message);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    worker = yield createWorker();
}))();
const io = (0, useSocket_1.useSocket)();
const addActiveUser = (socket, email) => {
    try {
        emailToSocket.set(email, socket);
        socketToEmail.set(socket.id, email);
        activeUsers.set(email, {
            email: email,
            socket: socket,
            producerId: "",
            consumerId: "",
            currentJoinedRoomId: "",
            producerTransportId: "",
            consumerTransportId: "",
        });
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.message);
    }
};
io.on("connection", (socket) => {
    console.log(socket.id, 'new user ');
    sockets.set(socket.id, socket);
    socket.on("addActiveUser", ({ email }) => {
        addActiveUser(socket, email);
    });
    socket.on("createRoom", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ roomId }, callback) {
        const router = yield createRouter();
        const userEmail = socketToEmail.get(socket.id);
        activeRooms.set(roomId, {
            router,
            roomMembers: [{ email: userEmail }], /// later we will replace socket.id with email 
        });
        yield RoomModel_1.default.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });
        updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);
        const roomJoinUrl = `/admin/v1/${roomId}`;
        callback({ routerRtpCapabilities: router === null || router === void 0 ? void 0 : router.rtpCapabilities, url: roomJoinUrl });
    }));
    socket.on('joinRoom', (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ roomId }, callback) {
        try {
            if (activeRooms.get(roomId).roomMembers.includes(socket.id)) {
                return;
            }
            else {
                const roomData = activeRooms.get(roomId);
                const router = roomData === null || roomData === void 0 ? void 0 : roomData.router;
                const userEmail = socketToEmail.get(socket.id);
                yield RoomModel_1.default.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });
                roomData.roomMembers = [...roomData.roomMembers, { email: userEmail }];
                activeRooms.set(roomId, roomData);
                updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);
                callback({ routerRtpCapabilities: router === null || router === void 0 ? void 0 : router.rtpCapabilities });
            }
        }
        catch (err) {
            console.log(err);
            throw new ApiError_1.default(err.message);
        }
    }));
    socket.on("createWebRtcTransport", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ consumer }, callback) {
        var _b, _c;
        const email = socketToEmail.get(socket.id);
        const roomId = (_b = activeUsers.get(email)) === null || _b === void 0 ? void 0 : _b.currentJoinedRoomId;
        const router = (_c = activeRooms.get(roomId)) === null || _c === void 0 ? void 0 : _c.router;
        if (consumer) {
            const transport = yield createWebRtcTransport(router, callback);
            addConsumerTransport(transport, roomId, email);
        }
        else {
            const transport = yield createWebRtcTransport(router, callback);
            addProducerTransport(transport, roomId, email);
        }
    }));
    socket.on("transport-connect", (_a) => __awaiter(void 0, [_a], void 0, function* ({ dtlsParameters, serverProducerTransportId }) {
        const { transport } = transports.get(serverProducerTransportId);
        yield transport.connect({ dtlsParameters });
    }));
    socket.on("transport-produce", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ kind, rtpParameters, serverProducerTransportId, roomId }, callback) {
        const { transport } = transports.get(serverProducerTransportId);
        const producer = yield transport.produce({ kind, rtpParameters });
        const roomMembers = activeRooms.get(roomId).roomMembers;
        const userEmail = socketToEmail.get(socket.id);
        addProducer(producer, roomId, userEmail);
        informConsumers(producer, roomId, userEmail);
        callback({ id: producer.id, roomMembers: roomMembers.length > 1 ? true : false });
    }));
    socket.on("transport-recv-connect", (_a) => __awaiter(void 0, [_a], void 0, function* ({ dtlsParameters, serverConsumerTransportId }) {
        const { transport } = transports.get(serverConsumerTransportId);
        yield transport.connect({ dtlsParameters });
    }));
    socket.on("getProducers", (callback) => {
        const userEmail = socketToEmail.get(socket.id);
        const producersList = getProducers(userEmail);
        callback({ producersList });
    });
    socket.on("consume", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ rtpCapabilities, producerId, serverConsumerTransportId }, callback) {
        const roomId = activeUsers.get(socket.id).currentJoinedRoomId;
        const router = activeRooms.get(roomId).router;
        if (router.canConsume({
            rtpCapabilities,
            producerId,
            paused: true
        })) {
            const consumerTransport = transports.get(serverConsumerTransportId).transport;
            const consumer = yield consumerTransport.consume({
                rtpCapabilities,
                producerId,
                paused: true
            });
            addConsumer(consumer, roomId, socket.id);
            callback({
                params: {
                    id: consumer.id,
                    rtpParameters: consumer.rtpParameters,
                    producerId,
                    kind: consumer.kind,
                }
            });
        }
    }));
    socket.on("consumer-resume", ({ consumerId }) => {
        const consumer = consumers.get(consumerId).consumer;
        consumer.resume();
    });
    socket.on("disconnect", () => {
        console.log(socket.id, 'disconnect');
        const disconnectedUserEmail = socketToEmail.get(socket.id);
        emailToSocket.delete(disconnectedUserEmail);
        activeUsers.delete(disconnectedUserEmail);
        sockets.delete(socket.id);
    });
});
const createRouter = () => __awaiter(void 0, void 0, void 0, function* () {
    const router = yield (worker === null || worker === void 0 ? void 0 : worker.createRouter({ mediaCodecs }));
    return router;
});
const createWebRtcTransport = (router, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transportOptions = {
            listenInfos: [{
                    protocol: "udp",
                    ip: "0.0.0.0",
                    announcedAddress: "192.168.1.5"
                }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            preferTcp: true,
        };
        const transport = yield (router === null || router === void 0 ? void 0 : router.createWebRtcTransport(transportOptions));
        callback({
            params: {
                id: transport === null || transport === void 0 ? void 0 : transport.id,
                iceParameters: transport === null || transport === void 0 ? void 0 : transport.iceParameters,
                iceCandidates: transport === null || transport === void 0 ? void 0 : transport.iceCandidates,
                dtlsParameters: transport === null || transport === void 0 ? void 0 : transport.dtlsParameters,
                sctpParameters: transport === null || transport === void 0 ? void 0 : transport.sctpParameters
            }
        });
        return transport;
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.message);
    }
});
const getProducers = (userEmail) => {
    try {
        const userData = activeUsers.get(userEmail);
        const roomId = userData.currentJoinedRoomId;
        const producersOfRoom = roomProducers.get(roomId);
        let producersList = [];
        producersOfRoom.forEach((producerData) => {
            if (producerData.email !== userEmail) {
                producersList = [...producersList, producerData.producerId];
            }
        });
        return producersList;
    }
    catch (err) {
        console.log(err);
    }
};
const addProducerTransport = (transport, roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        transports.set(transport.id, {
            transport,
            email,
            roomId
        });
        updateActiveUserPropState(email, "producerTransportId", transport.id);
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.message);
    }
});
const addConsumerTransport = (transport, roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        transports.set(transport.id, {
            transport,
            email,
            roomId
        });
        updateActiveUserPropState(email, "consumerTransportId", transport.id);
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.message);
    }
});
const addProducer = (producer, roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        producers.set(producer.id, {
            producer,
            email
        });
        if (roomProducers.has(roomId)) {
            const producersOfRoom = roomProducers.get(roomId);
            roomProducers.set(roomId, [...producersOfRoom, { producerId: producer.id, email }]);
        }
        else {
            roomProducers.set(roomId, [{ producerId: producer.id, email, }]);
        }
        updateActiveUserPropState(email, "producerId", producer.id);
    }
    catch (err) {
        console.log(err);
    }
});
const addConsumer = (consumer, roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        consumers.set(consumer.id, {
            consumer,
            email
        });
        updateActiveUserPropState(email, "consumerId", consumer.id);
    }
    catch (err) {
        console.log(err);
    }
});
const informConsumers = (producer, roomId, currentUserEmail) => {
    const roomMembers = activeRooms.get(roomId).roomMembers;
    const emails = roomMembers.filter((roomMember) => roomMember.email !== currentUserEmail);
    emails.forEach((email) => {
        console.log(email, "email");
        const socket = activeUsers.get(email).socket;
        socket.emit("new-producer", { producerId: producer.id });
    });
};
const getUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (err) {
        console.log(err);
    }
});
const updateActiveUserPropState = (email, prop, value) => {
    try {
        const userData = activeUsers.get(email);
        console.log(userData, 'userDta');
        userData[prop] = value;
        activeUsers.set(email, userData);
        console.log(activeUsers.get(email), 'activeUser');
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.message);
    }
};
const removeFromRoom = () => {
};
