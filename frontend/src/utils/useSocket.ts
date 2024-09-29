
import { useMemo } from "react";
import { useSelector } from "react-redux";
import * as io from "socket.io-client"

const useSocket = () => {

    const currentLoggedInUser = useSelector((state: any) => state?.currentUser?.currentLoggedInUser);

    try {


        const useSocketIo: io.Socket = io.connect("https://localhost:8700", {

            auth:{

                email:currentLoggedInUser.email

            }
          
        });

        return useSocketIo;

    } catch (err) {

        console.log(err);

    }


}


export { useSocket }


