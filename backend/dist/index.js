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
io.on("connection", (socket) => {
    console.log(socket.id, 'new user ');
    sockets.set(socket.id, socket);
    socket.on("addActiveUser", ({ email }) => {
        addActiveUser(socket, email);
    });
    socket.on("createRoom", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ roomId }, callback) {
        var _b;
        const router = yield createRouter();
        const userEmail = (_b = socketToEmail.get(socket.id)) === null || _b === void 0 ? void 0 : _b.email;
        activeRooms.set(roomId, {
            router,
            roomStatus: "ACTIVE",
            roomMembers: [{ email: userEmail }],
            admin: userEmail
        });
        yield RoomModel_1.default.findOneAndUpdate({ roomId }, {
            $set: {
                roomId: roomId, roomStatus: "ACTIVE",
                roomAdmin: { userEmail: userEmail, isAdmin: true }
            }, $push: { roomMembers: { userEmail: userEmail } }
        });
        updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);
        const roomJoinUrl = `/admin/v1/${roomId}`;
        callback({ routerRtpCapabilities: router === null || router === void 0 ? void 0 : router.rtpCapabilities, url: roomJoinUrl });
    }));
    socket.on('joinRoom', (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ roomId }, callback) {
        var _b, _c;
        try {
            if ((_b = activeRooms.get(roomId)) === null || _b === void 0 ? void 0 : _b.roomMembers.includes(socket.id)) {
                return;
            }
            else {
                const roomData = activeRooms.get(roomId);
                if (!roomData)
                    throw new ApiError_1.default(404, "no room with this id found");
                const router = roomData === null || roomData === void 0 ? void 0 : roomData.router;
                const userEmail = (_c = socketToEmail.get(socket.id)) === null || _c === void 0 ? void 0 : _c.email;
                yield RoomModel_1.default.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });
                roomData.roomMembers = [...roomData.roomMembers, { email: userEmail }];
                activeRooms.set(roomId, roomData);
                updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);
                callback({ routerRtpCapabilities: router === null || router === void 0 ? void 0 : router.rtpCapabilities });
            }
        }
        catch (err) {
            console.log(err);
        }
    }));
    socket.on("createWebRtcTransport", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ consumer }, callback) {
        const { router } = getRoomRouterAndMembers(socket.id);
        try {
            if (consumer) {
                const consumerTransport = yield createWebRtcTransport(router, callback);
                addConsumerTransport(consumerTransport, socket.id);
            }
            else {
                const producerTransport = yield createWebRtcTransport(router, callback);
                addProducerTransport(producerTransport, socket.id);
            }
        }
        catch (err) {
            console.log(err);
            throw new ApiError_1.default(err.code, err.message);
        }
    }));
    socket.on("transport-connect", (_a) => __awaiter(void 0, [_a], void 0, function* ({ serverSideProducerTransportId, dtlsParameters }) {
        try {
            const producerTransport = transports.get(serverSideProducerTransportId);
            yield producerTransport.connect({ dtlsParameters });
        }
        catch (err) {
            console.log(err);
            throw new ApiError_1.default(err.code, err.message);
        }
    }));
    socket.on("transport-produce", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ serverSideProducerTransportId, parameters }, callback) {
        try {
            const producerTransport = transports.get(serverSideProducerTransportId);
            const producer = yield producerTransport.produce(parameters);
            const { roomMembers } = getRoomRouterAndMembers(socket.id);
            callback({ id: producer.id, roomMembers: roomMembers.length > 1 ? true : false });
            addProducer(producer, socket.id);
            informConsumers(producer, socket.id);
        }
        catch (err) {
            console.log(err);
            throw new ApiError_1.default(err.code, err.message);
        }
    }));
    socket.on("transport-recv-connect", (_a) => __awaiter(void 0, [_a], void 0, function* ({ serverSideConsumerTransportId, dtlsParameters }) {
        try {
            const consumerTransport = transports.get(serverSideConsumerTransportId);
            yield consumerTransport.connect({ dtlsParameters });
        }
        catch (err) {
            console.log(err);
            throw new ApiError_1.default(err.code, err.message);
        }
    }));
    socket.on("getProducers", (callback) => {
        const { roomMembers } = getRoomRouterAndMembers(socket.id);
        const userEmail = socketToEmail.get(socket.id).email;
        const roomExistingMembers = roomMembers.filter((roomMember) => roomMember.email === userEmail);
        let producerIds = [];
        roomExistingMembers.forEach((member) => {
            const producerIdToFindProducer = activeUsers.get(member.email).producerId;
            const producerId = producers.get(producerIdToFindProducer).id;
            producerIds = [...producerIds, producerId];
        });
        callback({ producerIds });
    });
    socket.on("consume", (_a, callback_1) => __awaiter(void 0, [_a, callback_1], void 0, function* ({ producerId, rtpCapabilities, serverSideConsumerTransportId }, callback) {
        try {
            const { router } = getRoomRouterAndMembers(socket.id);
            if (router.canConsume({
                producerId,
                rtpCapabilities,
                paused: true
            })) {
                const consumerTransport = transports.get(serverSideConsumerTransportId);
                const consumer = yield consumerTransport.consume({
                    rtpCapabilities,
                    producerId,
                    paused: true
                });
                addConsumer(consumer, socket.id);
                callback({
                    id: consumer.id,
                    rtpParameters: consumer.rtpParameters,
                    producerId,
                    kind: consumer.kind
                });
            }
        }
        catch (err) {
            console.log(err);
            throw new ApiError_1.default(err.code, err.message);
        }
    }));
    socket.on("producerPause", (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
        const userData = activeUsers.get(email);
        const producer = producers.get(userData.producerId);
        producer.pause();
    }));
    socket.on("producerResume", (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
        const userData = activeUsers.get(email);
        const producer = producers.get(userData.producerId);
        producer.resume();
    }));
    socket.on("consumer-resume", ({ consumerId }) => {
        const consumer = consumers.get(consumerId);
        consumer.resume();
    });
    socket.on("leave-room", ({ roomId, email }, callback) => {
        leaveRoom(roomId, email, callback);
    });
    socket.on("end-meeting", ({ email, roomId }) => {
        try {
            const userData = activeUsers.get(email);
            const { admin } = getRoomRouterAndMembers(socket.id);
            if (admin === email) {
                endMeeting(roomId, email);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
    socket.on("disconnect", () => {
        console.log(socket.id, 'disconnect');
        const disconnectedUserEmail = socketToEmail.get(socket === null || socket === void 0 ? void 0 : socket.id);
        const userData = activeUsers.get(disconnectedUserEmail);
        leaveRoom(userData === null || userData === void 0 ? void 0 : userData.currentJoinedRoomId, disconnectedUserEmail);
        emailToSocket.delete(disconnectedUserEmail === null || disconnectedUserEmail === void 0 ? void 0 : disconnectedUserEmail.email);
        activeUsers.delete(disconnectedUserEmail === null || disconnectedUserEmail === void 0 ? void 0 : disconnectedUserEmail.email);
        socketToEmail.delete(socket.id);
        sockets.delete(socket.id);
    });
});
const addActiveUser = (socket, email) => {
    var _a;
    try {
        if (emailToSocket.get(email)) {
            const previousSocketObj = emailToSocket.get(email);
            updateActiveUserPropState(email, "email", email);
            updateActiveUserPropState(email, "socket", socket);
            previousSocketObj.socket = socket;
            socketToEmail.set(socket.id, socketToEmail.get(previousSocketObj.socket.id));
            emailToSocket.set(email, previousSocketObj);
            socketToEmail.delete((_a = previousSocketObj === null || previousSocketObj === void 0 ? void 0 : previousSocketObj.socket) === null || _a === void 0 ? void 0 : _a.id);
        }
        socketToEmail.set(socket.id, { email: email });
        emailToSocket.set(email, { socket: socket });
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
        throw new ApiError_1.default(err.code, err.message);
    }
};
const createRouter = () => __awaiter(void 0, void 0, void 0, function* () {
    const router = yield (worker === null || worker === void 0 ? void 0 : worker.createRouter({ mediaCodecs }));
    return router;
});
const createWebRtcTransport = (router, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const webRtcTransportOptions = {
            listenInfos: [{
                    protocol: "udp",
                    ip: "0.0.0.0",
                    announcedAddress: "192.168.1.4"
                }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            preferTcp: true,
        };
        const transport = yield (router === null || router === void 0 ? void 0 : router.createWebRtcTransport(webRtcTransportOptions));
        callback({
            params: {
                id: transport === null || transport === void 0 ? void 0 : transport.id,
                iceParameters: transport === null || transport === void 0 ? void 0 : transport.iceParameters,
                iceCandidates: transport === null || transport === void 0 ? void 0 : transport.iceCandidates,
                dtlsParameters: transport === null || transport === void 0 ? void 0 : transport.dtlsParameters,
            }
        });
        return transport;
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.code, err.message);
    }
});
const getRoomRouterAndMembers = (socketId) => {
    // this function will get the router of the room that user have joined and return it
    var _a, _b;
    const userEmail = (_a = socketToEmail.get(socketId)) === null || _a === void 0 ? void 0 : _a.email;
    const roomName = (_b = activeUsers.get(userEmail)) === null || _b === void 0 ? void 0 : _b.currentJoinedRoomId;
    const { router, roomMembers, admin } = activeRooms.get(roomName);
    return { router, roomMembers, admin };
};
const updateActiveUserPropState = (email, prop, value) => {
    try {
        const userData = activeUsers.get(email);
        userData[prop] = value;
        activeUsers.set(email, userData);
    }
    catch (err) {
        console.log(err);
        /// throw new ApiError(err.code, err.message);
    }
};
const addProducerTransport = (transport, socketId) => {
    transports.set(transport.id, transport);
    const userEmail = socketToEmail.get(socketId).email;
    updateActiveUserPropState(userEmail, "producerTransport", transport);
};
const addConsumerTransport = (transport, socketId) => {
    transports.set(transport.id, transport);
    const userEmail = socketToEmail.get(socketId).email;
    updateActiveUserPropState(userEmail, "consumerTransport", transport);
};
const addProducer = (producer, socketId) => {
    try {
        const userEmail = socketToEmail.get(socketId).email;
        updateActiveUserPropState(userEmail, "producerId", producer.id);
        producers.set(producer.id, producer);
    }
    catch (err) {
        console.log(err);
    }
};
const addConsumer = (consumer, socketId) => {
    try {
        const userEmail = socketToEmail.get(socketId).email;
        updateActiveUserPropState(userEmail, "consumerId", consumer.id);
        consumers.set(consumer.id, consumer);
    }
    catch (err) {
        console.log(err);
    }
};
const informConsumers = (producer, socketId) => {
    try {
        const { roomMembers } = getRoomRouterAndMembers(socketId);
        const userEmail = socketToEmail.get(socketId).email;
        const roomMembersToInform = roomMembers.filter((user) => user.email !== userEmail);
        roomMembersToInform.forEach((user) => {
            const socket = emailToSocket.get(user.email).socket;
            socket.emit("new-producer", { producerId: producer.id });
        });
    }
    catch (err) {
        console.log(err);
    }
};
const closeProducer = (producerId) => {
    try {
        const producer = producers.get(producerId);
        /// this will close the producer entirely
        /// means no more transmission of tracks
        producer.close();
    }
    catch (err) {
        console.log(err);
    }
};
/// end meeting related functions
const informAllThePeers = (email, message) => {
    try {
        const userSocket = activeUsers.get(email).socket;
        console.log(userSocket, 'sokcet');
        userSocket.emit("group-message", { message });
    }
    catch (err) {
        console.log(err);
    }
};
const endMeeting = (roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!activeRooms.get(roomId))
            throw new ApiError_1.default(404, "already ended the meeting");
        const { roomMembers } = activeRooms.get(roomId);
        const peersToInform = roomMembers.filter((member) => member.email !== email);
        peersToInform.forEach((member) => {
            informAllThePeers(member.email, "meeting has been ended");
        });
        roomMembers.forEach((member) => {
            const producerId = activeUsers.get(member.email).producerId;
            const producerIdToClose = producers.get(producerId).id;
            closeProducer(producerIdToClose);
        });
        const roomData = activeRooms.get(roomId);
        roomData.roomStatus = "CLOSED";
        activeRooms.delete(roomId);
        yield RoomModel_1.default.findOneAndUpdate({ roomId }, {
            $set: {
                roomStatus: "CLOSED"
            }
        });
    }
    catch (err) {
        console.log(err);
        throw new ApiError_1.default(err.code, err.message);
    }
});
const leaveRoom = (roomId, email, callback) => {
    try {
        const roomData = activeRooms.get(roomId);
        roomData.roomMembers = roomData.roomMembers.filter((member) => member.email !== email);
        activeRooms.set(roomId, roomData);
        const data = roomData.roomMembers.find((member) => member.email === email);
        if (!data) {
            callback({ data: true });
            const userData = activeUsers.get(email);
            userData.currentJoinedRoomId = "";
            activeUsers.set(email, userData);
        }
        ;
    }
    catch (err) {
        console.log(err);
    }
};
