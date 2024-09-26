
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
import MultipartyRoom from "./models/RoomModel"
import multer from "multer"
import ImageModel from "./models/imageModel/ImageModel";
import { upload } from "./middlewares/multer.middleware";
import { dotenvConfig } from "./dotenvConfig"
import { v2 as cloudinary } from "cloudinary"
import authenticateUser from "./middlewares/authenticateUser";
import { DtlsParameters } from "mediasoup/node/lib/fbs/web-rtc-transport";
import { isAwaitExpression } from "typescript";



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
            roomMembers: [{ email: userEmail }],

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

                if (!roomData) throw new ApiError(404, "no room with this id found");

                const router: mediasoupTypes.Router = roomData?.router;

                const userEmail = socketToEmail.get(socket.id)?.email;

                await MultipartyRoom.findOneAndUpdate({ roomId }, { $set: { roomId: roomId }, $push: { roomMembers: { userEmail: userEmail } } });

                roomData.roomMembers = [...roomData?.roomMembers, { email: userEmail }];

                activeRooms.set(roomId, roomData);



                updateActiveUserPropState(userEmail, "currentJoinedRoomId", roomId);

                callback({ routerRtpCapabilities: router?.rtpCapabilities });

            }



        } catch (err: any) {

            console.log(err);

            throw new ApiError(err.code, err.message);

        }


    });




    socket.on("createWebRtcTransport", async ({ consumer }: { consumer: boolean }, callback: Function) => {

        const { router }: { router: mediasoupTypes.Router } = getRoomRouterAndMembers(socket.id);

        try {

            if (consumer) {

                const consumerTransport: mediasoupTypes.WebRtcTransport | any = await createWebRtcTransport(router, callback);

                addConsumerTransport(consumerTransport, socket.id)

            } else {

                const producerTransport: mediasoupTypes.WebRtcTransport | any = await createWebRtcTransport(router, callback);

                addProducerTransport(producerTransport, socket.id)

            }

        } catch (err: any) {

            console.log(err);

            throw new ApiError(err.code, err.message)

        }

    });



    socket.on("transport-connect", async ({ serverSideProducerTransportId, dtlsParameters }: { serverSideProducerTransportId: string, dtlsParameters: mediasoupTypes.DtlsParameters }) => {

        try {

            const producerTransport: mediasoupTypes.WebRtcTransport = transports.get(serverSideProducerTransportId);

            await producerTransport.connect({ dtlsParameters });

        } catch (err: any) {

            console.log(err);

        }


    });





    socket.on("transport-produce", async ({ serverSideProducerTransportId, parameters }: { serverSideProducerTransportId: string, parameters: any }, callback: Function) => {

        try {

            const producerTransport: mediasoupTypes.WebRtcTransport = transports.get(serverSideProducerTransportId);

            const producer: mediasoupTypes.Producer = await producerTransport.produce(parameters);

            const { roomMembers } = getRoomRouterAndMembers(socket.id);

            callback({ id: producer.id, roomMembers: roomMembers.length > 1 ? true : false });

            addProducer(producer, socket.id);

            informConsumers(producer, socket.id);

        } catch (err: any) {

            console.log(err);

        }

    });


    socket.on("transport-recv-connect", async ({ serverSideConsumerTransportId, dtlsParameters }: { serverSideConsumerTransportId: string, dtlsParameters: mediasoupTypes.DtlsParameters }) => {

        try {

            const consumerTransport: mediasoupTypes.WebRtcTransport = transports.get(serverSideConsumerTransportId);

            await consumerTransport.connect({ dtlsParameters });

        } catch (err: any) {

            console.log(err);

        }


    });







    socket.on("getProducers", (callback: Function) => {

        const { roomMembers } = getRoomRouterAndMembers(socket.id);

        const userEmail = socketToEmail.get(socket.id).email;

        const roomExistingMembers = roomMembers.filter((roomMember: any) => roomMember.email === userEmail);

        let producerIds: string[] = []

        roomExistingMembers.forEach((member: any) => {

            const producerIdToFindProducer = activeUsers.get(member.email).producerId;

            const producerId: string = producers.get(producerIdToFindProducer).id;

            producerIds = [...producerIds, producerId]

        });

        callback({ producerIds });

    });



    socket.on("consume", async ({
        producerId,
        rtpCapabilities,
        serverSideConsumerTransportId },
        callback: Function) => {

        try {

            const { router } = getRoomRouterAndMembers(socket.id);

            if (router.canConsume({

                producerId,
                rtpCapabilities,
                paused: true

            })) {

                const consumerTransport = transports.get(serverSideConsumerTransportId);

                const consumer = await consumerTransport.consume({

                    rtpCapabilities,
                    producerId,
                    paused: true

                });

                console.log(consumer, 'consumerr')

                addConsumer(consumer, socket.id);


                callback({

                    id: consumer.id,
                    rtpParameters: consumer.rtpParameters,
                    producerId,
                    kind: consumer.kind

                });



            }




        } catch (err: any) {

            console.log(err);

        }

    })


    socket.emit("consumer-resume", ({ consumerId }: any) => {

        const consumer = consumers.get(consumerId);

        consumer.resume();

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





const createWebRtcTransport = async (router: mediasoupTypes.Router, callback: Function) => {

    try {

        const webRtcTransportOptions: mediasoupTypes.WebRtcTransportOptions = {

            listenInfos: [{

                protocol: "udp",
                ip: "0.0.0.0",
                announcedAddress: "192.168.1.6"

            }],

            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
            preferTcp: true,

        }

        const transport: mediasoupTypes.Transport | any = await router?.createWebRtcTransport(webRtcTransportOptions);

        callback({

            params: {

                id: transport?.id,
                iceParameters: transport?.iceParameters,
                iceCandidates: transport?.iceCandidates,
                dtlsParameters: transport?.dtlsParameters,
            }

        });



        return transport

    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.code, err.message);

    }


}



const getRoomRouterAndMembers = (socketId: string) => {

    // this function will get the router of the room that user have joined and return it

    try {

        const userEmail = socketToEmail.get(socketId)?.email

        const roomName = activeUsers.get(userEmail)?.currentJoinedRoomId;

        if (!roomName) throw new ApiError(401, "the room your trying to join either closed or do not exist, cannot proceed further");

        const { router, roomMembers } = activeRooms.get(roomName);

        return { router, roomMembers }

    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.code, err.message);

    }

}





const updateActiveUserPropState = (email: string, prop: string, value: any) => {

    try {

        const userData = activeUsers.get(email);

        userData[prop] = value;

        activeUsers.set(email, userData);

    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.code, err.message);



    }

}








const addProducerTransport = (transport: mediasoupTypes.WebRtcTransport, socketId: string) => {

    transports.set(transport.id, transport);

    const userEmail = socketToEmail.get(socketId).email

    const userData = activeUsers.get(userEmail);

    userData.producerTransport = transport;

    activeUsers.set(userEmail, userData);

}






const addConsumerTransport = (transport: mediasoupTypes.WebRtcTransport, socketId: string) => {

    transports.set(transport.id, transport);

    const userEmail = socketToEmail.get(socketId).email;

    const userData = activeUsers.get(userEmail);

    userData.consumerTransport = transport;

    activeUsers.set(userEmail, userData);


}



const addProducer = (producer: mediasoupTypes.Producer, socketId: string) => {

    try {


        const userEmail = socketToEmail.get(socketId).email;
        const userData = activeUsers.get(userEmail);

        userData.producerId = producer.id;

        activeUsers.set(userEmail, userData);

        producers.set(producer.id, producer);


    } catch (err: any) {

        console.log(err);

    }

}





const addConsumer = (consumer: mediasoupTypes.Consumer, socketId: string) => {

    try {


        const userEmail = socketToEmail.get(socketId).email;
        const userData = activeUsers.get(userEmail);

        userData.consumerId = consumer.id;

        activeUsers.set(userEmail, userData);

        consumers.set(consumer.id, consumer);


    } catch (err: any) {

        console.log(err);

    }

}





const informConsumers = (producer: mediasoupTypes.Producer, socketId: string) => {

    try {

        const { roomMembers } = getRoomRouterAndMembers(socketId);

        const userEmail = socketToEmail.get(socketId).email;

        const roomMembersToInform: any[] = roomMembers.filter((user: any) => user.email !== userEmail);

        roomMembersToInform.forEach((user: any) => {

            const socket = emailToSocket.get(user.email).socket;

            socket.emit("new-producer", { producerId: producer.id });

        });

    } catch (err: any) {

        console.log(err);

    }


}










