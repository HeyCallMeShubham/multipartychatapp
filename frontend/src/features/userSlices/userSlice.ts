

import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@reduxjs/toolkit/query";



interface iInitialState {

    currentLoggedInUser: any | undefined,
    isLoggedIn: boolean | undefined

}





const initialState: iInitialState = {

    currentLoggedInUser: undefined,
    isLoggedIn: undefined

}



const userSlice = createSlice({

    name: "userSlice",
    initialState,
    reducers: {

        setCurrentLoggedInUser: (state, action) => {

            const { data, isLoginSuccess }: { data: any, isLoginSuccess: boolean } = action.payload

            state.currentLoggedInUser = data
            state.isLoggedIn = isLoginSuccess

        }

    }



});





export const { setCurrentLoggedInUser } = userSlice.actions



export default userSlice.reducer




