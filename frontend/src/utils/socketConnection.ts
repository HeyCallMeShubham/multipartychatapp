import { useMemo } from "react";
import * as io from "socket.io-client"


const socketConnection = () => {

    const useSocketIo: io.Socket = io.connect("http://localhost:8700");

    useSocketIo.emit("addActiveUser", {

        email:"shubhamkumarin@gmail.com"

    });


    return useSocketIo;


}

export default socketConnection