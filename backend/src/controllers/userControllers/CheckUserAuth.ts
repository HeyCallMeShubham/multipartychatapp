import { Request, Response, NextFunction } from "express";
import asyncHandler from "../../utils/AsyncHandler";

const CheckUserAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const token = req?.cookies

    console.log(token, 'token');


});



export default CheckUserAuth


