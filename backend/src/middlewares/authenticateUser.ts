
import jwt from "jsonwebtoken"
import asyncHandler from "../utils/AsyncHandler"
import { Request, Response, NextFunction } from "express"
import reNewAccessToken from "../utils/reNewAcessToken"
import ApiError from "../utils/ApiError"


interface iRequest extends Request {

    user: {

        _id: string,
        email: string,
        userName: string,
        fullName: string

    }

}


const authenticateUser = asyncHandler(async (req: iRequest, res: Response, next: NextFunction) => {
    try {

        const accessToken = req.cookies[process.env.JWT_ACCESS_COOKIE_NAME as string]

        if (!accessToken) {

            await reNewAccessToken(req, res, next);

        } else {


            const JWT_SECRETKEY: any = process.env.JWT_ACCESS_TOKEN_SECRETKEY

            jwt.verify(accessToken, JWT_SECRETKEY, (err: any, user: any) => {

                if (err) {

                    console.log(err);

                    throw new ApiError(401, "token used or InValid login again");

                } else {

                    req.user = user

                    next();

                }

            });


        }

    } catch (error:any) {

        throw new ApiError(error.code, error.message)

    }

})

export default authenticateUser