
import { Socket, Server } from "socket.io"
import { Express } from "express"
import asyncHandler from "./AsyncHandler";
import { useExpressAppAndHttpsServer } from "./useExpressAndHttpsServer";

const { httpsServer } = useExpressAppAndHttpsServer()

const useSocket = (): Server => {

    const io: Server = new Server(httpsServer, {

        cors: {

            origin: ["http://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"]

        }

    });


    io.listen(8700)


    return io

};



export { useSocket }




