
import mongoose from "mongoose";

import asyncHandler from "../utils/AsyncHandler";
import { NextFunction } from "express";



export const connectDb = async () => {

    try {

        const MONGODBURL: string | any = process.env.MONGODBURL


        const { connection } = await mongoose.connect(MONGODBURL);

        if (connection) {

            console.log("connected with mongodb");

            return connection

        } else {

            console.log("couldnt connect");

        }


    } catch (err) {

        console.log(err);

    }

};















