import React from 'react'
import { useIsUserAuthenticated } from '../../utils/useIsUserAuthenticated'
import { Outlet, Navigate } from "react-router-dom";


const ProtectedRoutesWrapper = () => {


    const isUserLoggedIn: boolean | undefined = useIsUserAuthenticated();

    return isUserLoggedIn ? <Outlet /> : <Navigate to={`/user/v1/login`} />
    
}



export default ProtectedRoutesWrapper