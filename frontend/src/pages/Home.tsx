
import React, { useEffect, useMemo } from 'react'
import "../styles/pages/home.css"
import { MdOutlineSchedule } from "react-icons/md";
import { GrHost } from "react-icons/gr";
import { TbArrowsJoin2 } from "react-icons/tb";
import axios from 'axios';

import { redirect, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setMediaSoupState } from '../features/mediasoupSlice';



const Home = () => {


  const socketIo = useSelector((state: any) => state.socket.socket)

  const redirect = useNavigate();

  const dispatch = useDispatch();



  const createRoom = async () => {

    try {

      const { data } = await axios.post("https://localhost:4300/api/v1/room/create-room", {

        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },

      });



      if (data.success && data.code < 400) {

        const { url, roomId }: { url: string, roomId: string } = data.data

        socketIo?.emit("createRoom", { roomId: roomId }, ({ routerRtpCapabilities, url }: { routerRtpCapabilities: string, url: string }) => {

          dispatch(setMediaSoupState({ prop: "routerRtpCapabilities", value: routerRtpCapabilities }))

          redirect(url);

        });

      }

    } catch (err: any) {

      console.log(err);

    }

  }



  return (

    <div className='main-home-container'>

      <ul>

        <li className="roomOption scheduleRoom">
          schedule room
          <span className='roomOptionIconContainer'>
            <MdOutlineSchedule className="icon" /> </span>
        </li>



        <li className="roomOption joinRoom">
          join room
          <span className='roomOptionIconContainer'>
            <TbArrowsJoin2 className="icon" /> </span>
        </li>



        <li className="roomOption hostRoom" onClick={createRoom}>
          host room
          <span className='roomOptionIconContainer' >
            <GrHost className="icon" /> </span>
        </li>

      </ul>



    </div>

  )
}

export default Home