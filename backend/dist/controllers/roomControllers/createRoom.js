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
exports.createRoom = void 0;
const AsyncHandler_1 = __importDefault(require("./../../utils/AsyncHandler"));
const uuid_1 = require("uuid");
const RoomModel_1 = __importDefault(require("./../../models/RoomModel"));
const ApiError_1 = __importDefault(require("./../../utils/ApiError"));
const ApiResponse_1 = require("./../../utils/ApiResponse");
const createRoom = (0, AsyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = (0, uuid_1.v4)();
        const room = new RoomModel_1.default({
            roomId: roomId,
            /// roomDescription: "dont make too much noise",
            ///   roomMembers: [{ userEmail: "shubhamkumarin@2022@gmail.com", userName: "shubham", isAdmin: true }],
            // roomAdmins: [{ userEmail: "shubhamkumarin@2022@gmail.com", userName: "shubham", isSuspended: true }],
            // creatorOfRoom: { userEmail: 'shubhamkuamrin2022@gmail.com', userName: 'gff' }
        });
        const createdRoom = yield room.save();
        if (createdRoom) {
            const roomJoinUrl = `http://localhost:3000/room/v1/${createdRoom === null || createdRoom === void 0 ? void 0 : createdRoom.roomId}`;
            res.status(201).json(new ApiResponse_1.ApiResponse(201, { roomId: createdRoom.roomId }, "room created Successfully"));
        }
        else {
            throw new ApiError_1.default(400, "couldnt create room");
        }
    }
    catch (err) {
        console.log(err);
    }
}));
exports.createRoom = createRoom;
