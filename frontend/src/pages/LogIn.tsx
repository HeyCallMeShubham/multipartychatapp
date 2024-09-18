import React, { useEffect, useState } from 'react'
import "../styles/pages/login.css"
import { useSignInMutation } from '../features/rtkQuerySlices/SignInSlice';
import ErrorBoundary from '../errors/errorHandlers/ErrorBoundary';
import { useDispatch } from 'react-redux';
import { setCurrentLoggedInUser } from '../features/userSlices/userSlice';
import { log } from 'console';
import toast from 'react-hot-toast';


const LogIn = () => {


    const [email, setEmail] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    const [SignIn, { isLoading: loginLoading, data: loginData, error: loginError, isSuccess: isLoginSuccess }] = useSignInMutation();



    const dispatch = useDispatch();





    const handleSubmit = async (e: any) => {

        try {

            e.preventDefault();



            const payload: { password: string, email: string } = {

                password, email

            }


            SignIn(payload);

        } catch (err: any) {

            console.log(err);

        }


    }







    const setLoggedInUserAndRedirect = (loginData: any) => {

        try {

            dispatch(setCurrentLoggedInUser({ data: loginData.data, isLoginSuccess }));

            toast.success("account has been created successfully");

            // window.location.href = "/"

        } catch (err) {

            return ErrorBoundary(err);

        }

    }


    /// useEffect(() => {


    if (isLoginSuccess && loginData && loginData.code < 400 && loginData?.success) {

        setLoggedInUserAndRedirect(loginData);



    }


    //  }, [isLoginSuccess, loginData, loginData?.success]);





    if (loginError) {

       return <ErrorBoundary error={loginError} />

    }



    return (

        <div className='formContainer'>




            <form onSubmit={handleSubmit}>

                <input type="email" className='emailInput' placeholder="enter email" onChange={(e) => setEmail(e.target.value)} />

                <input type="password" className='passwordInput' placeholder="enter password" onChange={(e) => setPassword(e.target.value)} />

                <button type='submit'>Submit</button>


            </form>

        </div>
    )

}

export default LogIn