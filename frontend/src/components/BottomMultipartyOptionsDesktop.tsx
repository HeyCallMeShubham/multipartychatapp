
import React, { useCallback, useEffect, useState } from 'react'
import { IoMic } from "react-icons/io5";
import { IoMicOff } from "react-icons/io5";
import { IoIosReverseCamera } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { FaDisplay } from "react-icons/fa6";
import { FaMobileAlt } from "react-icons/fa";
import { FaVideo } from "react-icons/fa";
import { FaVideoSlash } from "react-icons/fa6";
import "../styles/components/bottomMultipartyOptionsDesktop.css"
import NestedMoreOptions from './NestedMoreOptions';
import { Navigate, Params, useNavigate, useParams } from 'react-router-dom';



const BottomMultipartyOptionsDesktop = ({ socket, userEmail }: any) => {

    const [isMicOn, setIsMicOn] = useState(false);

    const [isNestedOptionOpen, setIsNestedOptionOpen] = useState(false);

    const { roomId }: Readonly<Params<string>> = useParams();
    const redirect = useNavigate();
    const getMedia = async () => {

        try {

            const stream: any = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });




        } catch (err) {

            console.log(err);

        }

    }





    useEffect(() => {

        getMedia();

    }, []);




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




    const endMeeting = useCallback(() => {

        try {

            socket.emit("end-meeting", ({ roomId, email: userEmail }))

        } catch (err) {

            console.log(err);

        }

    }, []);






    const leaveMeeting = useCallback(() => {

        try {

            socket.emit("leave-room", { roomId, email: userEmail }, ({ data }: any) => {

                if (data) redirect("/")

            })

        } catch (err) {

            console.log(err);

        }

    }, []);








    return (

        <div className='bottomOptionsMainContianer hideWhenInMobile'>

            {isMicOn ?

                <span className='iconContainer ' data-after-content="Mute" onClick={toggleMic}><IoMic className='icon muteIcon ' /></span>
                : <span className='iconContainer ' onClick={toggleMic} data-after-content="Mute"> <IoMicOff className='icon muteIcon ' /></span>}

            {false ?
                <span className='iconContainer' data-after-content="Stop Video"><FaVideo className='icon  stopVideo' /></span> :
                <span className='iconContainer' data-after-content="Stop Video" ><FaVideoSlash className='icon stopVideo ' /></span>}


            <span className='iconContainer' data-after-content="Share Display" ><FaDisplay className='icon shareDesktopDisplayIcon' /> </span>

            {true
                ?
                <button className='leaveBtn btn' onClick={leaveMeeting}>LEAVE</button>
                :
                <button className='endBtn btn' onClick={endMeeting}>END</button>
            }



            <span className='iconContainer' data-after-content="Camera"> <IoIosReverseCamera className='icon reverseCameraIcon' /></span>
            <span className='iconContainer' data-after-content="Speaker"><HiOutlineSpeakerWave className='icon speakerWave' /></span>

            {isNestedOptionOpen ? <NestedMoreOptions /> : ""}

            <span className='iconContainer ' data-after-content="More"><BsThreeDots className='icon more' onClick={showNestedOption} /> </span>


        </div>


    )
}

export default BottomMultipartyOptionsDesktop