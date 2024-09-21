
import express, { Router } from "express";
import { createRoom } from "../controllers/roomControllers/createRoom"
import authenticateUser from "../middlewares/authenticateUser";


const roomRouter: Router = Router();



roomRouter.post("/create-room", authenticateUser, createRoom);







export { roomRouter }





