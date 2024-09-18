import React from 'react'
import toast from 'react-hot-toast'

const ErrorBoundary = (error: any) => {

    
    const { status, data }: { status: number, data: any } = error.error
    
    console.log(status, data, 'erorro')

    toast.error(data.message);

    return (

        <div className="error_boundary_main_container">

            <h2>status:{status}</h2>
            <h2>success status:{data.success ? "successful" : "unSuccessful"}</h2>
            <p>message:{data.message}</p>

        </div>
    )
}

export default ErrorBoundary







