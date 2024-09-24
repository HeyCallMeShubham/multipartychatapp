
import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import UserRouter from "./routers/userRoutes";
import { connectDb } from "./config/dbConnect";
import { roomRouter } from "./routers/roomRoutes";
import { useExpressAppAndHttpsServer } from "./utils/useExpressAndHttpsServer";
import { Server, Socket } from "socket.io";
import { useSocket } from "./utils/useSocket";
import asyncHandler from "./utils/AsyncHandler";
import fs from 'fs';
import path from 'path';
import * as mediasoup from "mediasoup";
import { types as mediasoupTypes } from "mediasoup";
import { createRoom } from "./controllers//roomControllers/createRoom";
import ApiError from "./utils/ApiError";
import { disconnect } from "mongoose";
import { DtlsParameters, } from "mediasoup/node/lib/types";
import MultipartyRoom from "./models/RoomModel"
import multer from "multer"
import ImageModel from "./models/imageModel/ImageModel";
import { upload } from "./middlewares/multer.middleware";
import { dotenvConfig } from "./dotenvConfig"
import { v2 as cloudinary } from "cloudinary"
import authenticateUser from "./middlewares/authenticateUser";


dotenvConfig();


const {

    createWorker,

} = mediasoup



const { Worker, Router, Transport, Producer, Consumer } = mediasoupTypes;



const { app, httpsServer, expressServer } = useExpressAppAndHttpsServer();


connectDb();








app.use(cors({

    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,

}));



app.use(bodyParser.json({ limit: "50mb" }));
app.use(cookieParser());
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/room", roomRouter);
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }))
app.use(express.static("public"));




cloudinary.config({


    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET


});




export const uploadOnCloudinary = async (localFilePath: any) => {

    try {

        if (!localFilePath) return null;

        const uploadedFile = await cloudinary.uploader.upload(localFilePath, {

            resource_type: "auto",

        });


        fs.unlinkSync(localFilePath);

        return uploadedFile;

    } catch (err: any) {

        fs.unlinkSync(localFilePath);

        throw new ApiError(400, err.message);

    }

}








const mediaCodecs: mediasoupTypes.RtpCodecCapability[] = [
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

]



let worker: mediasoupTypes.Worker | undefined

const activeRooms = new Map(); // this activeRooms object will store router and roomMembers array associated with a specific room  

const emailToSocket = new Map(); // this will have socket stored and identifier of it will be email

const socketToEmail = new Map(); // this will have email stored and identifier of it will be user socketId

const activeUsers = new Map(); /// this object will have activeUser object that includes email socket, transportId's etc 

const roomProducers = new Map([]); /// this array will have all the Producers of a room 

const transports = new Map(); /// this will have transports or users stored that we will identify by transport id of that specific transport 

const producers = new Map(); /// this will have producers or users stored that we will identify by producer id of that specific producer 

const consumers = new Map(); /// this will have consumers or users stored that we will identify by consumer id of that specific consumer 

const sockets = new Map();  // this will have stored entire socket object of and active user based upon socket id  







const createWorkerFunction = async () => {

    try {

        worker = await createWorker({

            rtcMinPort: 4000,
            rtcMaxPort: 5250

        });

        worker.on("died", (error) => {

            setTimeout(() => {

                process.exit(1);

            }, 2000);

        });

        return worker;

    } catch (err: any) {

        throw new Error(err.message);

    }


}




(async () => {

    worker = await createWorker();

})();



const io: Server = useSocket();





io.on("connection", (socket: Socket) => {

    console.log(socket.id, 'new user ');

    sockets.set(socket.id, socket);

    socket.on("addActiveUser", ({ email }) => {

        addActiveUser(socket, email);

    });





    socket.on("createRoom", async ({ roomId }, callback: Function) => {


        const router: mediasoupTypes.Router | undefined = await createRouter();


        const userEmail: string = socketToEmail.get(socket.id)?.email;


        activeRooms.set(roomId, {

            router,
            roomMembers: [{ email: userEmail }], /// later we will replace socket.id with email 

        });


        await MultipartyRoom.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });

        updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);

        const roomJoinUrl: string = `/admin/v1/${roomId}`

        callback({ routerRtpCapabilities: router?.rtpCapabilities, url: roomJoinUrl });


    });





    socket.on("disconnect", () => {

        console.log(socket.id, 'disconnect');

        const disconnectedUserEmail = socketToEmail.get(socket?.id);

        emailToSocket.delete(disconnectedUserEmail?.email);

        activeUsers.delete(disconnectedUserEmail?.email);

        socketToEmail.delete(socket.id);

        sockets.delete(socket.id);


    });


});







const addActiveUser = (socket: Socket, email: string) => {


    try {

        if (emailToSocket.get(email)) {

            const previousSocketObj: any = emailToSocket.get(email)

            const activeUserObj = activeUsers.get(email);

            previousSocketObj.socket = socket

            activeUserObj.email = email
            activeUserObj.socket = socket



            socketToEmail.set(socket.id, socketToEmail.get(previousSocketObj.socket.id));

            emailToSocket.set(email, previousSocketObj);

            activeUsers.set(email, activeUserObj);

            socketToEmail.delete(previousSocketObj?.socket?.id);



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



    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.code, err.message);

    }


}





const createRouter = async (): Promise<mediasoupTypes.Router | undefined> => {

    const router: mediasoupTypes.Router | undefined = await worker?.createRouter({ mediaCodecs });

    return router

}









const updateActiveUserPropState = (email: string, prop: string, value: any) => {



    try {

        const userData = activeUsers.get(email);

        console.log(userData, 'userDta')

        userData[prop] = value;

        activeUsers.set(email, userData);

        console.log(activeUsers.get(email), 'activeUser');

    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.message);



    }

}






