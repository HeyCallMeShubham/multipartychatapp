

class ApiResponse {

    code: number
    data: any
    message: string
    success: boolean

    constructor(statusCode: number, data: any, message: string = "success") {

        this.code = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400 // if statusCode lesser than 400 then return true 

    }

}



export { ApiResponse }


{/*


    // this same thing or functionality created
    // in functional components
    // its doing the same thing


    const ApiResponse = (statusCode: number, jsonData: any, operationMessage: string = "success") => {
        
    try {
        
    const code: number = statusCode
    const data: any = jsonData
    const message: string = operationMessage
        const success: boolean = statusCode < 400


        return { code, data, message, success }
        
    } catch (err) {
        
    console.log(err);

}

}

*/}
