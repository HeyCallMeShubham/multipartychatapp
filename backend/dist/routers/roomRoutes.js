"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = void 0;
const express_1 = require("express");
const createRoom_1 = require("../controllers/userControllers/roomControllers/createRoom");
const roomRouter = (0, express_1.Router)();
exports.roomRouter = roomRouter;
roomRouter.post("/create-room", createRoom_1.createRoom);
