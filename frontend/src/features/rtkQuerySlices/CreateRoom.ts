import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"



export const createRoomApi = createApi({

    reducerPath: "createRoomApi",
    baseQuery: fetchBaseQuery({

        baseUrl: `${process.env.REACT_APP_api_base_url}/v1/room/`,
        credentials: "include"

    }),
    endpoints: (builder) => ({

        createRoomApi: builder.mutation({

            query: () => ({

                url: "/create-room",
                method: "POST"

            })

        })

    })

});



export const {useCreateRoomApiMutation} = createRoomApi








