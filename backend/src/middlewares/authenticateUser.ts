
import jwt from "jsonwebtoken"
import asyncHandler from "../utils/AsyncHandler"
import { Request, Response, NextFunction } from "express"
import reNewAccessToken from "../utils/reNewAcessToken"
import ApiError from "../utils/ApiError"

interface iRequest extends Request {

    user?: any

}



const authenticateUser = asyncHandler(async (req: iRequest, res: Response, next: NextFunction) => {

    const accessToken = req.cookies.multipartyChatAccessToken

    if (!accessToken) {

        await reNewAccessToken(req, res, next);

    } else {


        const JWT_SECRETKEY: any = process.env.JWT_SECRETKEY

        jwt.verify(accessToken, JWT_SECRETKEY, (err: any, user: any) => {


            if (err) {

                throw new ApiError(401, "token used or not valid");

            } else {

                req.user = user

                next();

            }

        });


    }


})

export default authenticateUser