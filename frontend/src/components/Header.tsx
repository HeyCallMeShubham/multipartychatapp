
import React, { useEffect, useState } from 'react';
import "../styles/components/header.css";
import { Link, Outlet } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import NestedHamMenuBar from './NestedHamMenuBar';

import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { useLogOutApiMutation } from '../features/rtkQuerySlices/LogOutUserSlice';

const Header = () => {

    const [showMenuBarIcon, setShowMenuBarIcon] = useState(false);


    const [logOutApi, { isSuccess: isLogoutSuccess, data: logoutData, error, isLoading: isLogoutLoading }] = useLogOutApiMutation();


    useEffect(() => {

        if (isLogoutSuccess && logoutData && logoutData.success && logoutData.message === "logout successful" && logoutData.data.message === "logout_successful") {

            const currentLoggedInUser = localStorage.removeItem("persist:mulipartychatroom");

            window.location.href = "/user/v1/login"

        }

    }, [logoutData, isLogoutSuccess]);

    if (isLogoutLoading) {

        return <p>.....logging out</p>


    }


    const currentLoggedInUser = localStorage.getItem("persist:mulipartychatroom");

    return (

        <div className='header-main-container'>

            <header className='header'>

                <span className='logo'>LOGO</span>

                <span className='menuIconContainer'>
                    {showMenuBarIcon
                        ?
                        <RxCross2 className='icon' onClick={() => setShowMenuBarIcon(prevState => !prevState)} />
                        :
                        <GiHamburgerMenu className='icon' onClick={() => setShowMenuBarIcon(prevState => !prevState)} />}
                </span>

                {currentLoggedInUser ?

                    <button className='signInButton' onClick={logOutApi}>LogOut</button>
                    :

                    <Link to={`/user/v1/login`}>
                        <button className='signInButton'>Sign In</button>
                    </Link>

                }





            </header>

            {showMenuBarIcon ? <NestedHamMenuBar /> : ""}

            <Outlet />

        </div>

    )
}



export default Header



