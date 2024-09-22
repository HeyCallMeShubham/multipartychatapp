
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react"
import axios from "axios"



export const logOutUserAPi = createApi({

    reducerPath:"logOutApi",
    baseQuery:fetchBaseQuery({

       baseUrl:`${process.env.REACT_APP_api_base_url}/v1/user/`,
       credentials:"include",

    }),
    endpoints:(builder)=>({

        logOutApi:builder.mutation({

            query:()=>({

                url:"/logout",
                method:"POST",
                headers:{

                    "Content-Type":"application/json"

                }



            })

        })

    })



})





export const {useLogOutApiMutation} = logOutUserAPi








