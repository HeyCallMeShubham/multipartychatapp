
import { Request, Response, NextFunction } from "express";
import ApiError from "./ApiError";



const asyncHandler = (fn: Function) => async (req: Request, res: Response, next: NextFunction) => {

    try {

        await fn(req, res, next);

    } catch (err: any) {

        console.log(err.code, 'cause');

        

        res.status(err.code || 500).json({

            success: false,
            message: err.message

        });

       
 

    }


}





export default asyncHandler




