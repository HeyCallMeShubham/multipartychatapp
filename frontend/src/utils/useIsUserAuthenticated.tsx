import React, { useEffect, useState } from 'react'
import { useCheckUserAuthApiQuery } from '../features/rtkQuerySlices/checkUserValidationSlice'

const useIsUserAuthenticated = ():boolean => {

    const [isUserAuthenticated, setIsUserAuthenticated] = useState<boolean>();

    const { isSuccess, data:userAuthData, isLoading, error }: any = useCheckUserAuthApiQuery({});

 
    if (userAuthData) {

        setIsUserAuthenticated(true);

    }


    if (error) {

        setIsUserAuthenticated(false);
        
        localStorage.removeItem("persist:mulipartychatroom");

        localStorage.clear()

    }


    const isCurrentUserLoggedIn = localStorage.getItem("persist:mulipartychatroom")

    return isCurrentUserLoggedIn ? true : false

}

export { useIsUserAuthenticated }