import React, { useCallback, useEffect, useMemo } from 'react'
import { useIsUserAuthenticated } from '../../utils/useIsUserAuthenticated'
import { Outlet, Navigate } from "react-router-dom";
import { useCheckUserAuthApiQuery } from '../../features/rtkQuerySlices/checkUserValidationSlice';
import toast from 'react-hot-toast';
import { useLogOutApiMutation } from '../../features/rtkQuerySlices/LogOutUserSlice';
import ErrorBoundary from '../../errors/errorHandlers/ErrorBoundary';


const ProtectedRoutesWrapper = () => {


    const { isSuccess, data: userAuthData, isLoading, error: userAuthError }: any = useCheckUserAuthApiQuery({});


    const [logOutApi] = useLogOutApiMutation();


    const logOutApiFunc:Function = useMemo(() => logOutApi, [])


    useEffect(() => {

        if (userAuthError && userAuthError.status === 500) {

            console.log(userAuthError, 'erro')

            localStorage.removeItem("persist:mulipartychatroom");

            localStorage.clear();

            logOutApiFunc();

            window.location.href = "/user/v1/login"

        }


    }, [userAuthError, isLoading]);




    /// if (isSuccess && userAuthData && userAuthData.code < 400 && userAuthData.data.isValid && userAuthData.message === "validToken" && userAuthData.success) {


    ///   const currentLoggedInUser = localStorage.getItem("persist:mulipartychatroom");

    ///   return currentLoggedInUser ? <Outlet /> : <Navigate to="/user/v1/login" />
    ///  }





    const currentLoggedInUser = localStorage.getItem("persist:mulipartychatroom");

    return currentLoggedInUser ? <Outlet /> : <Navigate to="/user/v1/login" />



}



export default ProtectedRoutesWrapper