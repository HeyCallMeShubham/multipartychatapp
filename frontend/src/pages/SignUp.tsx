import React, { useEffect, useState } from 'react'
import "../styles/pages/signup.css"
import { useSignUpMutation } from '../features/rtkQuerySlices/SignUp';
import ErrorBoundary from '../errors/errorHandlers/ErrorBoundary';
import axios from "axios"
import { json } from 'node:stream/consumers';
import toast from 'react-hot-toast';




const SignUp = () => {

    const [fullName, setFullName] = useState<string>("");

    const [userName, setUserName] = useState<string>("");

    const [email, setEmail] = useState<string>("");

    const [password, setPassword] = useState<string>("");

    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [profileImage, setProfileImage] = useState<any>();

    const [SignUp, { isLoading: isSignUpLoading, data: signUpData, error: signUpError, isSuccess: isSignUpSuccess, }] = useSignUpMutation();





    const converToBase64 = (file: any) => {

        return new Promise((resolve, reject) => {

            const fileReader = new FileReader();

            fileReader.readAsDataURL(file);

            fileReader.onload = () => {

                resolve(fileReader.result)

            }

            fileReader.onerror = (error) => {

                reject(error)

            }

        })


    }





    const handleFileUpload = async (e: any) => {

        const file = e.target.files[0];

        const base64: any = await converToBase64(file);

        setProfileImage([base64])


    }





    const handleSubmit = (e: any) => {

        e.preventDefault();

        try {

            const payload: any = {

                fullName,
                email,
                userName,
                password,

            }

            const formData = new FormData();

            formData.append("profileImage", profileImage);
            formData.append("userName", userName);
            formData.append("fullName", fullName);
            formData.append("email", email);
            formData.append("password", password);

            SignUp(formData);

        } catch (err: any) {

            console.log(err);

        }

    }



    if (isSignUpSuccess && signUpData) {

        console.log(signUpData, isSignUpSuccess, 'gg')

        const { code, data, message, success } = signUpData

        if (code < 400 && success) {

            toast.success(data.message)

            window.location.href = "/user/v1/login"

        }

    }




    if (!signUpData && signUpError) {

        return <ErrorBoundary error={signUpError} />

    }



    return (
        <div className='formContainer'>

            <img src={signUpData?.data?.profileImage} />

            <form onSubmit={handleSubmit}>

                <input type="text" className='fullNameInput' placeholder="enter fullName" onChange={(e) => setFullName(e.target.value)} />

                <input type="text" className='userNameInput' placeholder="enter userName" onChange={(e) => setUserName(e.target.value)} />

                <input type="email" className='emailInput' placeholder="enter email" onChange={(e) => setEmail(e.target.value)} />

                <input type="password" className='passwordInput' placeholder="enter password" onChange={(e) => setPassword(e.target.value)} />

                <input type="password" className='confirmPasswordInput' placeholder="confirm password" onChange={(e) => setConfirmPassword(e.target.value)} />

                <input type="file" name="profileImage" className='user-profileImage' onChange={(e: any) => setProfileImage(e.target.files[0])} accept=".jpg, .png, .jpg" />


                <button type='submit'>Submit</button>

            </form>








        </div>
    )
}

export default SignUp