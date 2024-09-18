import axios from "axios";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

axios.defaults.withCredentials = true


export const SignUpApiSlice = createApi({

    reducerPath: "signUpApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${process.env.REACT_APP_api_base_url}/v1/user/`,
        credentials: "include"
    }),
    endpoints: (builder) => ({

        signUp: builder.mutation({

            query: (formData: any) => ({

                url: "register",
                method: "POST",
                body: formData,
            })
        })
    })
});




export const { useSignUpMutation } = SignUpApiSlice





