

import { createSlice } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";


interface initialStateType {

    socket: Socket | undefined

}

const initialState: initialStateType = {

    socket: undefined

}


const socketIoSlice = createSlice({

    name: "socketIoSlice",
    initialState,
    reducers: {

        setSocketStates: (state: any, action) => {

            const { prop, value } = action.payload;

            state[prop] = value

        }

    }


});



export const { setSocketStates } = socketIoSlice.actions

export default socketIoSlice.reducer

