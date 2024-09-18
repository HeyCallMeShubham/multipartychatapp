import { Request, Response, NextFunction } from "express";
import MultipartychatUserModel from "../../models/UserModel";
import asyncHandler from "../../utils/AsyncHandler";
import ApiError from "../../utils/ApiError";
import { generateAccessAndRefreshToken } from "../../utils/generateAccessAndRefreshToken";
import { ApiResponse } from "../../utils/ApiResponse";




const SignIn = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { email: clientEmail, password: clientPassword } = req.body

    console.log(req.body, 'req.body')

    try {

        const user: any = await MultipartychatUserModel.findOne({ email: clientEmail })

        if (!user) {

            throw new ApiError(404, "no user with email id exist");

        }

        

        const isPasswordValid = await user.isPasswordCorrect(clientPassword);

        if (!isPasswordValid) {

            throw new ApiError(401, "Invalid User Credentials");

        }


        const { refreshToken: userRefreshToken, accessToken: userAccessToken }: { refreshToken: string, accessToken: string } = await generateAccessAndRefreshToken(user.id);



        interface httpOptions {

            maxAge: number,
            httpOnly: boolean,
            secure: boolean

        };



        const httpOnlyOptionsforRefreshToken: httpOptions = {

            maxAge: 172800000,
            httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
            secure: true

        }



        const httpOnlyOptionsforAccessToken: httpOptions = {

            maxAge: 54000000,
            httpOnly: true, //// using this httpOnly attribute will only allow to modify these cookies only through server not from client or browser 
            secure: true

        }


        

        res.cookie("multipartychatrefreshtoken", userRefreshToken, httpOnlyOptionsforRefreshToken);

        res.cookie("multipartychataccesstoken", userAccessToken, httpOnlyOptionsforAccessToken);



        const { password, refreshToken, createdAt, updatedAt, ...rest }: any = user._doc

        return res.status(200).json(new ApiResponse(201, rest, "Logged In Successfully"));


    } catch (error: any) {


        throw new ApiError(error.code, error?.message || "something went wrong")


    }


})





export { SignIn }