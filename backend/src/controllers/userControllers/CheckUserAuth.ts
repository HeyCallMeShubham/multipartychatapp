import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/AsyncHandler";
import jwt from "jsonwebtoken";
import ApiError from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";



const CheckUserAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
        const refreshToken = req?.cookies.multipartychatrefreshtoken

        if (!refreshToken) {

            throw new ApiError(404, "no refresh token found either expired or not available please login again");

        }

        const refreshTokenSecretKey = process.env.JWT_REFRESH_TOKEN_SECRETKEY as string

        const isTokenVerified = jwt.verify(refreshToken, refreshTokenSecretKey);

        if (isTokenVerified) {

            return res.status(200).json(new ApiResponse(200, { isValid: true }, "validToken"))

        } else {

            throw new ApiError(400, "inValidToken");

        }

    } catch (err: any) {

        throw new ApiError(err.code, err.message);

    }




});



export default CheckUserAuth


