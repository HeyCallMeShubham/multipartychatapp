
import express, { Router } from "express";
import { createRoom } from "../controllers/roomControllers/createRoom"


const roomRouter: Router = Router();



roomRouter.post("/create-room", createRoom);







export { roomRouter }





