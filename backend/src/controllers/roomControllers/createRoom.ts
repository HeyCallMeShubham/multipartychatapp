
import asyncHandler from "./../../utils/AsyncHandler";
import { v4, parse as parseuuid } from "uuid";
import MultipartyRoom from "./../../models/RoomModel";
import ApiError from "./../../utils/ApiError";
import { ApiResponse } from "./../../utils/ApiResponse";
import { NextFunction, Request, Response } from "express";



const createRoom = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {



    try {

        const roomId: string = v4();

        const room = new MultipartyRoom({

            roomId: roomId,
           /// roomDescription: "dont make too much noise",
         ///   roomMembers: [{ userEmail: "shubhamkumarin@2022@gmail.com", userName: "shubham", isAdmin: true }],
           // roomAdmins: [{ userEmail: "shubhamkumarin@2022@gmail.com", userName: "shubham", isSuspended: true }],
           // creatorOfRoom: { userEmail: 'shubhamkuamrin2022@gmail.com', userName: 'gff' }

        });


        const createdRoom: any = await room.save();


        if (createdRoom) {

            const roomJoinUrl: string = `http://localhost:3000/room/v1/${createdRoom?.roomId}`

            res.status(201).json(new ApiResponse(201, { roomId: createdRoom.roomId }, "room created Successfully"));

        } else {

            throw new ApiError(400, "couldnt create room");

        }

    } catch (err) {

        console.log(err)

    }


});



export { createRoom }


