
import { useMemo } from "react";
import * as io from "socket.io-client"

const useSocket = () => {

    try {

        const useSocketIo: io.Socket = io.connect("http://localhost:8700");

        return useSocketIo

    } catch (err) {

        console.log(err);

    }


}


export { useSocket }


