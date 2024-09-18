

declare global {

    namespace NodeJs {

        interface ProcessEnv {

            MONGODBURL: string,
            HOST: string,
            NODE_ENV: "development" | "production",
            JWT_SECRETKEY: string | any,

            CLOUDINARY_CLOUD_NAME: string,
            CLOUDINARY_API_KEY: string,
            CLOUDINARY_API_SECRET: string


            CLOUDINARY_URL: string


        }

    }

}






