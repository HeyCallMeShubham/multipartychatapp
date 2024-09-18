
import { Request, Response, NextFunction } from "express";
import MultipartychatUserModel from "../../models/UserModel";
import { ErrorHandler } from "../../utils/ErrorHandler";
import asyncHandler from "../../utils/AsyncHandler";
import ApiError from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import bcrypt from "bcryptjs";
import multer from "multer";
import { uploadOnCloudinary } from "../../index";
import { UploadApiResponse } from "cloudinary";
import fs from "fs"


const SignUp = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    console.log(req.body, 'req.body');
    console.log(req?.file?.path, 'req.file');


    const {

        fullName,
        userName,
        email,
        password,
        profileImage

    } = req.body

    try {

        const localFilePath: string | undefined | any = req.file?.path;


        const emailExist = await MultipartychatUserModel.findOne({ email })

        if (emailExist) {
            
            fs.unlinkSync(localFilePath);

            throw new ApiError(409, "user with this email already exists");


        } else {

            
            const user:any = new MultipartychatUserModel({

                userName,
                fullName,
                email,
                password,

            });


            if (user) {
                
                const profilePhoto: UploadApiResponse | null = await uploadOnCloudinary(localFilePath)
               
                user.profileImage = profilePhoto?.url
            
                const createdUser: any = await user.save();

                

                if (createdUser) {
                    
                    res.status(201).json(new ApiResponse(201, createdUser, "user created Successfully"));

                } else {

                    throw new ApiError(500, "Internal server error Couldnt create Account try again later");

                }

            }

        }


    } catch (error: any) {

        throw new ApiError(error.code, error?.message || "something went wrong");

    }

})


export default SignUp


