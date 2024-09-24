import { useMemo } from "react";
import { useSelector } from "react-redux";
import * as io from "socket.io-client"


const socketConnection = (userEmail: string) => {

    console.log(userEmail, 'emaisus')


    const useSocketIo: io.Socket = io.connect("http://localhost:8700");

    useSocketIo.emit("addActiveUser", {

        email: userEmail

    });


    return useSocketIo;


}

export default socketConnection