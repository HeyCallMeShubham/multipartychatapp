
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "./AsyncHandler";
import ApiError from "./ApiError";



const reNewAccessToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const refreshToken = req.cookies.multipartyChatRefreshToken 

    if(!refreshToken){

        throw new ApiError(401, "you have no refresh token to access this resource pleae go and login again");

    }else{

        const secretKey:any = process.env.JWT_SECRETKEY

        jwt.verify(refreshToken, secretKey, (err:any, decodedData:any) =>{

        if(err){

         throw new ApiError(401, "your token is invalid");

        }else{

            interface httpOptions {

                maxAge: number,
                httpOnly: boolean,
                secure: boolean

            };


            const httpOnlyOptionsforAccessToken: httpOptions = {

                maxAge: 54000000,
                httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
                secure: true

            }


 
        const { userId, userName, email } = decodedData

        const accesssToken = jwt.sign({ email: email, userId: userId }, secretKey);

        res.cookie("multipartyChatAccessToken", accesssToken, httpOnlyOptionsforAccessToken)


        next();


        }

        })


    }

})

export default reNewAccessToken