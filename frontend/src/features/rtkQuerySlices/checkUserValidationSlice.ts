
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";


axios.defaults.withCredentials = true

export const checkUserAuthenticationApi = createApi({

    //reducerPath is a unique identifer or key that
    //that your service will be mounted on in redux store

    reducerPath: "checkUserAuthenticationApi",

    // baseQuery is used by each endpoint if no
    // (query function) or option is specified , 
    // rtk query exports a utility called (fetchBaseQuery)
    // as a lightweight wrapper around fetch for 
    // common use case


    baseQuery: fetchBaseQuery({

        // fetchBaseQuery is a lightweight wrapper

        baseUrl: `${process.env.REACT_APP_api_base_url}/v1/user/`,
        credentials: "include"

    }),
    endpoints: (builder) => ({

        checkUserAuthApi: builder.query({

            query: () => ({
                url: '/checkuserauthentication',
                method: "GET",
                headers: {

                    credentials: "include"

                }
            })
        })

    })

});



export const { useCheckUserAuthApiQuery } = checkUserAuthenticationApi




