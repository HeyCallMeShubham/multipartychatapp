
import { combineReducers, configureStore, EnhancedStore, Reducer } from "@reduxjs/toolkit";
import mediasoupSlice from "../features/mediasoupSlice";
import socketIoSlice from "../features/socketIOSlices/socketIo";
import { SignUpApiSlice } from "../features/rtkQuerySlices/SignUp";
import { SignInApiSlice } from "../features/rtkQuerySlices/SignInSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { WebStorage } from "redux-persist/lib/types";
import { Persistor } from "redux-persist/lib/types";
import userSlice from "../features/userSlices/userSlice";
import { checkUserAuthenticationApi } from "../features/rtkQuerySlices/checkUserValidationSlice";
import { logOutUserAPi } from "../features/rtkQuerySlices/LogOutUserSlice";



interface iPersistConfig {

    key: string,
    version: number,
    blacklist: any[],
    storage: WebStorage

}


const persistConfig: iPersistConfig = {

    key: "mulipartychatroom",
    version: 1,
    blacklist: ["socket", SignInApiSlice.reducerPath, SignUpApiSlice.reducerPath, checkUserAuthenticationApi.reducerPath],
    storage

}




const rootReducer: Reducer = combineReducers({

    socket: socketIoSlice,
    mediaSoupStates: mediasoupSlice,
    currentUser: userSlice,



    [SignUpApiSlice.reducerPath]: SignUpApiSlice.reducer,
    [SignInApiSlice.reducerPath]: SignInApiSlice.reducer,
    [checkUserAuthenticationApi.reducerPath]: checkUserAuthenticationApi.reducer,
    [logOutUserAPi.reducerPath]: logOutUserAPi.reducer



});



const persistedReducer: Reducer = persistReducer(persistConfig, rootReducer);



export const store: EnhancedStore = configureStore({

    reducer: persistedReducer, // if reducer field is an single slice function such as userSlice then it will directly be used as rootReducer
    /// else if reducer field has object of slice reducers like {user:userSlice, post:postSlice} in that case configure store 
    // will automatically create the root reducer by passing this object to the redux combineReducers utility

    middleware: (getDefaultMiddleware) => getDefaultMiddleware({

        /// getDefaultMiddleware returns a array 
        /// containing default list of middlewares

        serializableCheck: false

    }).concat(

        SignUpApiSlice.middleware,
        SignInApiSlice.middleware,
        checkUserAuthenticationApi.middleware,
        logOutUserAPi.middleware,


    )

});





// this persistStore method basically persists
// the store and returns and persistor object 





export const persistor = persistStore(store);



export type RootState = ReturnType<typeof store.getState>



export type AppDispatch = typeof store.dispatch


