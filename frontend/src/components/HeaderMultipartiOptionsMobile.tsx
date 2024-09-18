import React from 'react'
import { IoMic } from "react-icons/io5";
import { IoMicOff } from "react-icons/io5";
import { IoIosReverseCamera } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { FaDisplay } from "react-icons/fa6";
import { FaMobileAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa6";

import "../styles/components/headerMultipartyMobile.css"


const HeaderMultipartiOptionsMobile = () => {
    return (

        <div className='header hideWhenInDesktop'>

            <div className='header-options-container'>

                <span className='iconContainer' data-after-content="Camera"> <IoIosReverseCamera className='icon reverseCameraIcon' /></span>
                <span className='iconContainer' data-after-content="Speaker"><HiOutlineSpeakerWave className='icon speakerWave' /></span>

            </div>

            <h4 className='logo'>LOGO</h4>


            {true
                ?
                <button className='leaveBtn btn'>LEAVE</button>
                :
                <button className='endBtn btn'>END</button>
            }


        </div>

    )
}

export default HeaderMultipartiOptionsMobile