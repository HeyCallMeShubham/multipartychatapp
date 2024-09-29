"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var roomStatus;
(function (roomStatus) {
    roomStatus["ACTIVE"] = "ACTIVE";
    roomStatus["INACTIVE"] = "INACTIVE";
    roomStatus["CLOSED"] = "CLOSED";
})(roomStatus || (roomStatus = {}));
const roomSchema = new mongoose_1.Schema({
    roomId: { type: String, required: true },
    roomDescription: { type: String },
    roomMembers: [{ userEmail: String, isAdmin: Boolean, }],
    roomAdmin: { userEmail: String, isAdmin: Boolean },
    suspendedUsers: [{ userEmail: String, userName: String, isSuspended: Boolean }],
    creatorOfRoom: { type: mongoose_1.Schema.Types.ObjectId, ref: "MultipartyChatUser" },
    roomStatus: { type: String, enum: roomStatus, default: roomStatus.INACTIVE }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("MultipartyChatroom", roomSchema);
