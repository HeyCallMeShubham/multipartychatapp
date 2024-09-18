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
    roomAdmins: [{ userEmail: String, isAdmin: Boolean }],
    suspendedUsers: [{ userEmail: String, userName: String, isSuspended: Boolean, }],
    creatorOfRoom: { userEmail: String, userName: String },
    roomStatus: { type: String, enum: roomStatus, default: roomStatus.INACTIVE }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Multipartyroom", roomSchema);
