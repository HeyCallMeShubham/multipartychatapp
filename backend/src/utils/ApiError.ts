

class ApiError extends Error {


    statusCode: number
    data?: any | undefined | null
    success: boolean
    errors: any[]
    stack?: any | undefined



    constructor(statusCode: number, message: string = "something went wrong", errors: any[] = [], stack: any = "") {


        super(message);

        this.statusCode = statusCode

        this.message = message

        this.data = null

        this.success = false

        this.errors = errors


        if (stack) {

            this.stack = stack

        } else {

            Error.captureStackTrace(this, this.constructor);

        }

    }

}



export default ApiError






