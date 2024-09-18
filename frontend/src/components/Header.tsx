
import React, { useState } from 'react';
import "../styles/components/header.css";
import { Link, Outlet } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import NestedHamMenuBar from './NestedHamMenuBar';

import { RxCross2 } from "react-icons/rx";

const Header = () => {

    const [showMenuBarIcon, setShowMenuBarIcon] = useState(false);

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


                <Link to={`/user/v1/login`}>
                    <button className='signInButton'>Sign In</button>
                </Link>



            </header>

            {showMenuBarIcon ? <NestedHamMenuBar /> : ""}

            <Outlet />

        </div>

    )
}



export default Header



