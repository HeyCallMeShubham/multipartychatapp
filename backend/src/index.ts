
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



const addActiveUser = (socket: Socket, email: string) => {

    try {

        emailToSocket.set(email, socket);

        socketToEmail.set(socket.id, email);

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

        throw new ApiError(err.message);

    }

}





io.on("connection", (socket: Socket) => {

    console.log(socket.id, 'new user ');

    sockets.set(socket.id, socket);

    socket.on("addActiveUser", ({ email }) => {

        addActiveUser(socket, email);

    });





    socket.on("createRoom", async ({ roomId }: { roomId: string }, callback: Function) => {

        const router: mediasoupTypes.Router | undefined = await createRouter();


        const userEmail: string = socketToEmail.get(socket.id);


        activeRooms.set(roomId, {

            router,
            roomMembers: [{ email: userEmail }], /// later we will replace socket.id with email 

        });


        await MultipartyRoom.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });

        updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);

        const roomJoinUrl: string = `/admin/v1/${roomId}`

        callback({ routerRtpCapabilities: router?.rtpCapabilities, url: roomJoinUrl });

    });




    socket.on('joinRoom', async ({ roomId }: { roomId: string }, callback: Function) => {

        try {

            if (activeRooms.get(roomId).roomMembers.includes(socket.id)) {

                return

            } else {

                const roomData: any = activeRooms.get(roomId);

                const router: mediasoupTypes.Router = roomData?.router;

                const userEmail = socketToEmail.get(socket.id);

                await MultipartyRoom.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });

                roomData.roomMembers = [...roomData.roomMembers, { email: userEmail }]

                activeRooms.set(roomId, roomData);

                updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);

                callback({ routerRtpCapabilities: router?.rtpCapabilities });

            }


        } catch (err: any) {

            console.log(err);

            throw new ApiError(err.message);

        }


    });




    socket.on("createWebRtcTransport", async ({ consumer }: { consumer: boolean }, callback: Function) => {

        const email: string = socketToEmail.get(socket.id)

        const roomId: string = activeUsers.get(email)?.currentJoinedRoomId;

        const router: mediasoupTypes.Router = activeRooms.get(roomId)?.router;



        if (consumer) {

            const transport = await createWebRtcTransport(router, callback);

            addConsumerTransport(transport, roomId, email);

        } else {

            const transport = await createWebRtcTransport(router, callback);

            addProducerTransport(transport, roomId, email)

        }


    });




    socket.on("transport-connect", async ({ dtlsParameters, serverProducerTransportId }: { dtlsParameters: DtlsParameters, serverProducerTransportId: string }) => {

        const { transport } = transports.get(serverProducerTransportId);

        await transport.connect({ dtlsParameters });

    });





    socket.on("transport-produce", async ({ kind, rtpParameters, serverProducerTransportId, roomId }: any, callback: Function) => {



        const { transport } = transports.get(serverProducerTransportId);

        const producer: mediasoupTypes.Producer = await transport.produce({ kind, rtpParameters });

        const roomMembers = activeRooms.get(roomId).roomMembers;

        const userEmail: string = socketToEmail.get(socket.id);

        addProducer(producer, roomId, userEmail);

        informConsumers(producer, roomId, userEmail);

        callback({ id: producer.id, roomMembers: roomMembers.length > 1 ? true : false });


    });



    socket.on("transport-recv-connect", async ({ dtlsParameters, serverConsumerTransportId }: { dtlsParameters: DtlsParameters, serverConsumerTransportId: string }) => {

        const { transport } = transports.get(serverConsumerTransportId);

        await transport.connect({ dtlsParameters });

    });



    socket.on("getProducers", (callback: Function) => {


        const userEmail: string = socketToEmail.get(socket.id);

        const producersList: any = getProducers(userEmail);


        callback({ producersList });

    });



    socket.on("consume", async ({ rtpCapabilities, producerId, serverConsumerTransportId }, callback: Function) => {

        const roomId: string = activeUsers.get(socket.id).currentJoinedRoomId;

        const router = activeRooms.get(roomId).router


        if (router.canConsume({

            rtpCapabilities,
            producerId,
            paused: true

        })) {


            const consumerTransport = transports.get(serverConsumerTransportId).transport;


            const consumer = await consumerTransport.consume({

                rtpCapabilities,
                producerId,
                paused: true

            });


            addConsumer(consumer, roomId, socket.id);


            callback({

                params: {

                    id: consumer.id,
                    rtpParameters: consumer.rtpParameters,
                    producerId,
                    kind: consumer.kind,

                }

            });

        }

    });





    socket.on("consumer-resume", ({ consumerId }: any) => {

        const consumer = consumers.get(consumerId).consumer;

        consumer.resume();


    });



    socket.on("disconnect", () => {

        console.log(socket.id, 'disconnect');


        const disconnectedUserEmail = socketToEmail.get(socket.id);

        emailToSocket.delete(disconnectedUserEmail);

        activeUsers.delete(disconnectedUserEmail);

        sockets.delete(socket.id);


    });


});





const createRouter = async (): Promise<mediasoupTypes.Router | undefined> => {

    const router: mediasoupTypes.Router | undefined = await worker?.createRouter({ mediaCodecs });

    return router

}





const createWebRtcTransport = async (router: mediasoupTypes.Router, callback: Function): Promise<mediasoupTypes.Transport> => {

    try {


        const transportOptions: mediasoupTypes.WebRtcTransportOptions = {

            listenInfos: [{

                protocol: "udp",
                ip: "0.0.0.0",
                announcedAddress: "192.168.1.5"

            }],

            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            preferTcp: true,

        }


        const transport: mediasoupTypes.WebRtcTransport = await router?.createWebRtcTransport(transportOptions);



        callback({


            params: {

                id: transport?.id,
                iceParameters: transport?.iceParameters,
                iceCandidates: transport?.iceCandidates,
                dtlsParameters: transport?.dtlsParameters,
                sctpParameters: transport?.sctpParameters

            }

        });

        return transport

    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.message);

    }

}






const getProducers = (userEmail: string) => {

    try {

        const userData = activeUsers.get(userEmail);

        const roomId = userData.currentJoinedRoomId;

        const producersOfRoom: any = roomProducers.get(roomId);

        let producersList: any = []

        producersOfRoom.forEach((producerData: any) => {

            if (producerData.email !== userEmail) {

                producersList = [...producersList, producerData.producerId];

            }

        });



        return producersList

    } catch (err: any) {

        console.log(err);

    }

}







const addProducerTransport = async (transport: mediasoupTypes.Transport, roomId: string, email: string) => {

    try {


        transports.set(transport.id, {

            transport,
            email,
            roomId

        });


        updateActiveUserPropState(email, "producerTransportId", transport.id);


    } catch (err: any) {

        console.log(err)

        throw new ApiError(err.message);

    }

}







const addConsumerTransport = async (transport: mediasoupTypes.Transport, roomId: string, email: string) => {

    try {

        transports.set(transport.id, {

            transport,
            email,
            roomId

        });


        updateActiveUserPropState(email, "consumerTransportId", transport.id);


    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.message);

    }

}



const addProducer = async (producer: mediasoupTypes.Producer, roomId: string, email: string) => {

    try {

        producers.set(producer.id, {

            producer,
            email

        });


        if (roomProducers.has(roomId)) {

            const producersOfRoom: any = roomProducers.get(roomId);

            roomProducers.set(roomId, [...producersOfRoom, { producerId: producer.id, email }]);

        } else {

            roomProducers.set(roomId, [{ producerId: producer.id, email, }]);

        }


        updateActiveUserPropState(email, "producerId", producer.id);



    } catch (err) {

        console.log(err);

    }

}




const addConsumer = async (consumer: mediasoupTypes.Consumer, roomId: string, email: string) => {

    try {

        consumers.set(consumer.id, {

            consumer,
            email

        });


        updateActiveUserPropState(email, "consumerId", consumer.id);


    } catch (err) {

        console.log(err);

    }

}










const informConsumers = (producer: mediasoupTypes.Producer, roomId: string, currentUserEmail: string) => {

    const roomMembers = activeRooms.get(roomId).roomMembers;


    const emails = roomMembers.filter((roomMember: { email: string }) => roomMember.email !== currentUserEmail);

    emails.forEach((email: string) => {

        console.log(email, "email");

        const socket = activeUsers.get(email).socket

        socket.emit("new-producer", { producerId: producer.id })

    });



}






const getUser = async () => {

    try {




    } catch (err: any) {

        console.log(err);

    }
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




const removeFromRoom = () => {



}








