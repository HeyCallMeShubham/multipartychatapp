
import React, { useEffect, useMemo } from 'react'
import "../styles/pages/home.css"
import { MdOutlineSchedule } from "react-icons/md";
import { GrHost } from "react-icons/gr";
import { TbArrowsJoin2 } from "react-icons/tb";
import axios from 'axios';

import { redirect, useNavigate } from 'react-router-dom';

import { useDispatch, useSelector } from 'react-redux';
import { setMediaSoupState } from '../features/mediasoupSlice';
import { useCreateRoomApiMutation } from '../features/rtkQuerySlices/CreateRoom';
import ErrorBoundary from '../errors/errorHandlers/ErrorBoundary';



const Home = () => {


  const socketIo = useSelector((state: any) => state.socket.socket)

  const redirect = useNavigate();

  const dispatch = useDispatch();





  const [createRoomApi, { isSuccess, data, isLoading, isError, error }]:any = useCreateRoomApiMutation();






  useEffect(() => {


    if (isSuccess && data && data?.success && data?.code < 400) {

      const { url, roomId }: { url: string, roomId: string } = data.data

      socketIo?.emit("createRoom", { roomId: roomId }, ({ routerRtpCapabilities, url }: { routerRtpCapabilities: string, url: string }) => {

        dispatch(setMediaSoupState({ prop: "routerRtpCapabilities", value: routerRtpCapabilities }))

        redirect(url);

      });

    }


  }, [data, isLoading]);






  useEffect(() => {

    if (isError && error) {

    alert(error?.data?.message);

    }

  }, [isError, error]);



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



        <li className="roomOption hostRoom" onClick={createRoomApi}>
          {isLoading ? "......creating room" : "host room"}
          <span className='roomOptionIconContainer' >
            <GrHost className="icon" /> </span>
        </li>

      </ul>



    </div>

  )
}

export default Home