
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "./AsyncHandler";
import ApiError from "./ApiError";
import { generateAccessAndRefreshToken } from "./generateAccessAndRefreshToken";


interface iRequest extends Request {

    user: {

        _id: string,
        email: string,
        userName: string,
        fullName: string

    }

}

const reNewAccessToken = asyncHandler(async (req: iRequest, res: Response, next: NextFunction) => {
    try {

        const refreshToken = req.cookies[process.env.JWT_REFRESH_COOKIE_NAME as string]

        if (!refreshToken) {

            throw new ApiError(401, "you have no refresh token to access this resource pleae go and login again");

        } else {

            const secretKey: any = process.env.JWT_REFRESH_TOKEN_SECRETKEY

            jwt.verify(refreshToken, secretKey, async (err: any, userData: any) => {

                if (err) {

                    throw new ApiError(401, "your token is invalid");

                } else {

                    interface httpOptions {

                        maxAge: number,
                        httpOnly: boolean,
                        secure: boolean,
                        sameSite: string,

                    };



                    const httpOnlyOptionsforAccessToken: httpOptions = {

                        maxAge: 54000000,
                        httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
                        secure: true,
                        sameSite: "None"

                    }

                    const httpOnlyOptionsforRefreshToken: httpOptions = {

                        maxAge: 172800000,
                        httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
                        secure: true,
                        sameSite: "None"

                    }



                    const { _id, userName, email } = userData


                    const { accessToken, refreshToken }: { accessToken: string, refreshToken: string } = await generateAccessAndRefreshToken(_id);


                    res.cookie(process.env.JWT_ACCESS_COOKIE_NAME as string, accessToken, httpOnlyOptionsforAccessToken as any)
                    res.cookie(process.env.JWT_REFRESH_COOKIE_NAME as string, refreshToken, httpOnlyOptionsforRefreshToken as any)

                    req.user = userData

                    next();

                }

            })


        }

    } catch (error:any) {


        throw new ApiError(error.code, error.message)

    }
})

export default reNewAccessToken