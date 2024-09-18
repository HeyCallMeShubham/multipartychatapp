
import * as express from "express";



interface CustomError extends Error {

    statusCode: number,
    message: string

}





const createCustomError = (statusCode: number, message: string): CustomError => {

    const error = new Error(message) as CustomError

    error.statusCode = statusCode
    error.message = message

    return error

}



export const ErrorHandler = (statusCode: number, message: string): CustomError => {

    return createCustomError(statusCode, message);

}


