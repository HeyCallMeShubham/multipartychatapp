
import React, { useState } from 'react';
import { IoMic } from "react-icons/io5";
import { IoMicOff } from "react-icons/io5";
import { IoIosReverseCamera } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { FaDisplay } from "react-icons/fa6";
import { FaMobileAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa6";
import "../styles/components/bottomMultipartiOptionsMobile.css";

const BottomMultipartyOptionsMobile = ({ socket, userEmail }: any) => {


    const [isMicOn, setIsMicOn] = useState(false);

    const [isNestedOptionOpen, setIsNestedOptionOpen] = useState(false);



    const toggleMic = () => {

        try {

            if (isMicOn) {

                setIsMicOn(false);

            } else {

                setIsMicOn(true);

            }

        } catch (err) {

            console.log(err);

        }

    }



    const showNestedOption = () => {

        try {

            if (isNestedOptionOpen) {

                setIsNestedOptionOpen(false);

            } else {

                setIsNestedOptionOpen(true);

            }

        } catch (err) {

            console.log(err);

        }

    }






    return (

        <div className='bottomOptionsMainContainerMobile hideWhenInDesktop' style={{}}>

            {isMicOn
                ?
                <span className='iconContainer ' data-after-content="Mute" onClick={toggleMic}><IoMic className='icon muteIcon ' /></span>
                :
                <span className='iconContainer ' onClick={toggleMic} data-after-content="Mute"> <IoMicOff className='icon muteIcon ' /></span>}


            {false
                ?
                <span className='iconContainer' data-after-content="Stop Video"><FaVideo className='icon  stopVideo' /></span>
                :
                <span className='iconContainer' data-after-content="Play Video" ><FaVideoSlash className='icon stopVideo ' /></span>}


            <span className='iconContainer' data-after-content="Share Display" ><FaDisplay className='icon shareDesktopDisplayIcon' /> </span>

            <span className='iconContainer ' data-after-content="More"><BsThreeDots className='icon more' onClick={showNestedOption} /> </span>


        </div>

    )
}

export default BottomMultipartyOptionsMobile