
import { Document } from "mongoose";
import MultipartychatUserModel from "../models/UserModel";
import ApiError from "./ApiError";


const generateAccessAndRefreshToken = async (userId: string) => {

    try {


        const user: any = await MultipartychatUserModel.findById(userId);
        console.log(user, 'user')

        const refreshToken: any = await user.generateRefreshToken();

        const accessToken: any = await user.generateAccessToken();

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken }

    } catch (err: any) {

        console.log(err);

        throw new ApiError(err.code, err.message);

    }

}





export { generateAccessAndRefreshToken }





