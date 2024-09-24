"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = void 0;
const express_1 = require("express");
const createRoom_1 = require("../controllers/roomControllers/createRoom");
const authenticateUser_1 = __importDefault(require("../middlewares/authenticateUser"));
const roomRouter = (0, express_1.Router)();
exports.roomRouter = roomRouter;
roomRouter.post("/create-room", authenticateUser_1.default, createRoom_1.createRoom);
