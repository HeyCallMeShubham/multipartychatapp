
import asyncHandler from "./../../utils/AsyncHandler";
import { v4, parse as parseuuid } from "uuid";
import MultipartyRoom from "./../../models/RoomModel";
import ApiError from "./../../utils/ApiError";
import { ApiResponse } from "./../../utils/ApiResponse";
import { NextFunction, Request, Response } from "express";


interface iRequest extends Request {

    user: {

        _id: string,
        email: string,
        userName: string,
        fullName: string

    }

}


const createRoom = asyncHandler(async (req: iRequest, res: Response, next: NextFunction) => {



    try {

        const roomId: string = v4();

        const room = new MultipartyRoom({

            roomId: roomId,
            creatorOfRoom: req.user._id

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


