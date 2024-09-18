
import axios from "axios";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

axios.defaults.withCredentials = true;

export const SignInApiSlice = createApi({

    reducerPath: "signInApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.REACT_APP_api_base_url}/v1/user/`,
        credentials: "include"    
    }),
    endpoints: (builder) => ({
        SignIn: builder.mutation({
            query: (payload: any) => ({

                url: "login",
                method: "POST",
                body: payload,
                headers: {

                    "Content-type": "application/json"

                }

            })
        })

    })

});





export const { useSignInMutation } = SignInApiSlice




