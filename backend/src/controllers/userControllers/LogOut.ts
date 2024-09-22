
import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/AsyncHandler";
import MultipartychatUserModel from "../../models/UserModel";
import { ApiResponse } from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";


interface iRequest extends Request {

    user: {

        _id: string,
        email: string,
        userName: string,
        fullName: string

    }

}


const LogOut = asyncHandler(async (req: iRequest, res: Response, next: NextFunction) => {

    try {


        await MultipartychatUserModel.
            findByIdAndUpdate(req.user._id,
                { $set: { refreshToken: undefined } },
                { new: true });


        interface httpOptions {

            httpOnly: boolean,
            secure: boolean,
            sameSite: string,

        };


        const httpOnlyOptionsforRefreshToken: httpOptions = {

            httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
            secure: true,
            sameSite: "None"

        }


        const httpOnlyOptionsforAccessToken: httpOptions = {


            httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
            secure: true,
            sameSite: "None"

        }


        console.log(
            process.env.JWT_ACCESS_COOKIE_NAME,
            process.env.JWT_REFRESH_COOKIE_NAME,
            "dsewds"
        );


        res
            .status(200)
            .clearCookie(process.env.JWT_ACCESS_COOKIE_NAME as string, httpOnlyOptionsforAccessToken as any)
            .clearCookie(process.env.JWT_REFRESH_COOKIE_NAME as string, httpOnlyOptionsforRefreshToken as any)
            .json(new ApiResponse(200, { message: "logout_successful" }, "logout successful"));




    } catch (error: any) {

        console.log(error)


        throw new ApiError(error.code, error.message)

    }

});



export default LogOut;



