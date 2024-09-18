
import { Document } from "mongoose";
import MultipartychatUserModel from "../models/UserModel";
import ApiError from "./ApiError";


const generateAccessAndRefreshToken = async (userId: string) => {

    try {

        
        const user: any = await MultipartychatUserModel.findById(userId);
        

        const refreshToken: any = user.generateRefreshToken();

        const accessToken: any = user.generateAccessToken();

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false });

        return { refreshToken, accessToken }

    } catch (err: any) {

        console.log(err);

        throw new ApiError(500, "something went wrong");

    }

}





export { generateAccessAndRefreshToken }





