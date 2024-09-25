


import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoMic } from "react-icons/io5";
import { IoMicOff } from "react-icons/io5";
import { IoIosReverseCamera } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { FaDisplay } from "react-icons/fa6";
import * as mediasoupClient from "mediasoup-client";
import { types as mediasouptypes } from "mediasoup-client"
import { FaMobileAlt } from "react-icons/fa";

import { FaVideo } from "react-icons/fa";

import { FaVideoSlash } from "react-icons/fa6";

import NestedMoreOptions from '../components/NestedMoreOptions';

import "../styles/pages/multipartyConversation.css"

import BottomMultipartyOptionsDesktop from '../components/BottomMultipartyOptionsDesktop';

import BottomMultipartyOptionsMobile from '../components/BottomMultipartyOptionsMobile';

import HeaderMultipartiOptionsMobile from '../components/HeaderMultipartiOptionsMobile';
import StreamVideo from '../components/StreamVideo';
import { useDispatch, useSelector } from 'react-redux';
import { setMediaSoupState } from '../features/mediasoupSlice';
import { StateFromReducersMapObject } from 'redux';

import { MediaKind, RtpCapabilities, RtpParameters } from 'mediasoup-client/lib/RtpParameters';
import { useParams } from 'react-router-dom';
import { createTypeReferenceDirectiveResolutionCache } from 'typescript';
import { DtlsParameters, Transport } from 'mediasoup-client/lib/types';
import RemoteStream from '../components/RemoteStream';
import { create } from 'node:domain';


const AdminPanel = () => {


  const mediaSoupStateProps = useSelector((state: any) => state.mediaSoupStates)

  const localStream: any = useRef(null);

  const [isMicOn, setIsMicOn] = useState(false);

  const [isNestedOptionOpen, setIsNestedOptionOpen] = useState(false);

  const socketIo = useSelector((state: any) => state.socket.socket);


  const dispatch = useDispatch();

  const { roomId }: any = useParams();




  useEffect(() => {

    socketIo.on("new-producer", ({ producerId }: { producerId: string }) => {
 
      dispatch(setMediaSoupState({ prop: "producerIds", value: producerId }));

    });



    return () => {

      //unMounting the event

      socketIo.on("new-producer");

    }

  }, [socketIo]);






  const getMediaTracks = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];


      dispatch(setMediaSoupState({ prop: "videoParams", value: { track: videoTrack, ...mediaSoupStateProps.videoParams } }));

      dispatch(setMediaSoupState({ prop: "audioParams", value: { track: audioTrack } }));

      localStream.current.srcObject = stream

    } catch (err: any) {

      alert(err.message);

      console.log(err);

    }

  }


  useEffect(() => {

    getMediaTracks();

  }, []);



  useEffect(() => {

    if (mediaSoupStateProps.routerRtpCapabilities !== undefined) {

      createDevice();

    }


  }, [mediaSoupStateProps.routerRtpCapabilities]);


 


  const createDevice = useCallback(async () => {

    try {

      const device: mediasouptypes.Device = new mediasoupClient.Device()


      await device.load({

        routerRtpCapabilities: mediaSoupStateProps.routerRtpCapabilities

      });


      dispatch(setMediaSoupState({ prop: "device", value: device }));


      createSendTransport(device);

    } catch (err) {

      console.log(err);

    }


  }, [mediaSoupStateProps.routerRtpCapabilities]);





  const createSendTransport = useCallback(async (device: mediasouptypes.Device) => {

    try {

      socketIo?.emit("createWebRtcTransport", { consumer: false }, async ({ params }: any) => {

        const producerTransport: mediasouptypes.Transport = device.createSendTransport(params);

        dispatch(setMediaSoupState({ prop: "producerTransport", value: producerTransport }));

        producerTransport.on("connect", async ({ dtlsParameters }: { dtlsParameters: mediasouptypes.DtlsParameters }, callback: Function, errback: Function) => {

          try {

            await socketIo.emit("transport-connect", { serverSideProducerTransportId: params.id, dtlsParameters });

            callback();

          } catch (error: any) {

            console.log(error);

            errback(error);

          }

        });


        producerTransport.on("produce", async (parameters: any, callback: Function, errback: Function) => {

          try {

            await socketIo.emit("transport-produce", {
              serverSideProducerTransportId: params.id,
              parameters: {
                kind: parameters.kind,
                rtpParameters: parameters.rtpParameters
              }
            }, ({ id, roomMembers }: { id: string, roomMembers: boolean }) => {

              if (roomMembers) getProducers();

              callback({ id });

            });

          } catch (error: any) {

            errback(error);

            console.log(error);

          }

        });

      });

    } catch (err: any) {

      console.log(err);

    }

  }, [mediaSoupStateProps.device]);





  useEffect(() => {

    if (mediaSoupStateProps.producerTransport !== undefined && mediaSoupStateProps.audioParams !== undefined && mediaSoupStateProps.videoParams !== undefined) {

      connectSendTransport();

    }

  }, [mediaSoupStateProps.producerTransport, mediaSoupStateProps.audioParams, mediaSoupStateProps.videoParams]);





  const connectSendTransport = useCallback(async () => {

    try {

      const audioProducer = await mediaSoupStateProps?.producerTransport?.produce(mediaSoupStateProps.audioParams);
      const videoProducer = await mediaSoupStateProps?.producerTransport?.produce(mediaSoupStateProps.videoParams);

    } catch (err: any) {

      console.log(err);

    }

  }, [mediaSoupStateProps.producerTransport, mediaSoupStateProps.audioParams, mediaSoupStateProps.videoParams]);





  const getProducers = () => {




  }











  const toggleMic = () => {

    try {

      if (isMicOn) {

        setIsMicOn(false);

        const tracks = localStream;

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
    <div className="father-container">

      <HeaderMultipartiOptionsMobile />


      <div className='streams-container'>


        <StreamVideo stream={localStream} />

        {mediaSoupStateProps?.streamTracks?.map((stream: MediaStreamTrack) => (

          <RemoteStream track={stream} />

        ))}


      </div>


      <BottomMultipartyOptionsDesktop />
      <BottomMultipartyOptionsMobile />

    </div >
  )
}

export default AdminPanel