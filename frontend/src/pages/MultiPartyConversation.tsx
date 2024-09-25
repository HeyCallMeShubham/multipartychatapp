


import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoMic } from "react-icons/io5";
import { IoMicOff } from "react-icons/io5";
import { IoIosReverseCamera } from "react-icons/io";
import { BsThreeDots } from "react-icons/bs";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { FaDisplay } from "react-icons/fa6";
import * as mediasoup from "mediasoup-client"
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




const MultiPartyConversation = () => {

  const mediaSoupStateProps = useSelector((state: any) => state.mediaSoupStates)

  const localStream: any = useRef(null);

  const [isMicOn, setIsMicOn] = useState(false);

  const [isNestedOptionOpen, setIsNestedOptionOpen] = useState(false);

  //  const socketIoServer = useSocket();

  const socketIo = useSelector((state: any) => state.socket.socket);


  const dispatch = useDispatch();

  const { roomId }: any = useParams();




  useEffect(() => {

    socketIo.on("new-producer", ({ producerId }: { producerId: string }) => {

      console.log(producerId, 'newProducerId');

      dispatch(setMediaSoupState({ prop: "producerIds", value: producerId }));

    });



    return () => {

      socketIo.on("new-producer");

    }


  }, [socketIo]);







  const getMediaTracks = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

      const audioTrack = stream.getAudioTracks()[0]
      const videoTrack = stream.getVideoTracks()[0]


      dispatch(setMediaSoupState({ prop: "audioParams", value: { track: audioTrack, ...mediaSoupStateProps.audioParams } }));
      dispatch(setMediaSoupState({ prop: "videoParams", value: { track: videoTrack, ...mediaSoupStateProps.videoParams } }));


      localStream.current.srcObject = stream


      socketIo?.emit("joinRoom", { roomId }, ({ routerRtpCapabilities }: { routerRtpCapabilities: RtpCapabilities }) => {

        dispatch(setMediaSoupState({ prop: "routerRtpCapabilities", value: routerRtpCapabilities }));

      });

    } catch (err) {

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

      const device: mediasouptypes.Device = new mediasoup.Device();

      await device.load({ routerRtpCapabilities: mediaSoupStateProps.routerRtpCapabilities })

      dispatch(setMediaSoupState({ prop: "device", value: device }));

    } catch (err: any) {

      console.log(err);

    }


  }, [mediaSoupStateProps.routerRtpCapabilities]);





  useEffect(() => {

    if (mediaSoupStateProps.device !== undefined) {


      createSendTransport();


    }

  }, [mediaSoupStateProps.device]);






  const createSendTransport = useCallback(async () => {

    try {

      socketIo?.emit("createWebRtcTransport", { consumer: false }, async ({ params }: any) => {

        const producerTransport: Transport = await mediaSoupStateProps?.device?.createSendTransport(params);

        dispatch(setMediaSoupState({ prop: "producerTransport", value: producerTransport }));

        producerTransport.on("connect", ({ dtlsParameters }: { dtlsParameters: DtlsParameters }, callback: Function, errback: Function) => {

          try {

            socketIo.emit("transport-connect", { dtlsParameters, serverProducerTransportId: params.id });

            callback();

          } catch (err: any) {

            console.log(err);

          }

        });



        producerTransport.on("produce", (parameters: { kind: MediaKind, rtpParameters: RtpParameters }, callback: Function, errback: Function) => {

          try {

            socketIo.emit("transport-produce", { kind: parameters.kind, rtpParameters: parameters.rtpParameters, serverProducerTransportId: params.id, roomId }, ({ id, roomMembers }: { id: string, roomMembers: boolean }) => {

              callback({ id });

              if (roomMembers) getProducers();

            });

          } catch (err: any) {

            console.log(err);

          }

        });

      });


    } catch (err) {

      console.log(err);

    }

  }, [mediaSoupStateProps.device]);





  useEffect(() => {

    if (mediaSoupStateProps.producerTransport !== undefined && mediaSoupStateProps.audioParams && mediaSoupStateProps.videoParams) {

      connectSendTransport();

    }


  }, [mediaSoupStateProps.producerTransport, mediaSoupStateProps.audioParams, mediaSoupStateProps.videoParams]);





  const connectSendTransport = useCallback(async () => {

    try {

      const audioProducer = await mediaSoupStateProps.producerTransport?.produce(mediaSoupStateProps.audioParams);
      const videoProducer = await mediaSoupStateProps.producerTransport?.produce(mediaSoupStateProps.videoParams);



    } catch (err) {

      console.log(err);

    }

  }, [mediaSoupStateProps.producerTransport, mediaSoupStateProps.audioParams, mediaSoupStateProps.videoParams])




  useEffect(() => {


    if (mediaSoupStateProps.producerIds.length) {

      mediaSoupStateProps.producerIds.forEach((producerId: string) => {

        signalNewConsumerTransport(producerId);

      });

    }

  }, [mediaSoupStateProps.producerIds]);





  const signalNewConsumerTransport = async (remoteProducerId: string) => {

    try {

      socketIo.emit("createWebRtcTransport", { consumer: true }, async ({ params }: any) => {

        const consumerTransport: mediasouptypes.Transport = mediaSoupStateProps.device.createRecvTransport(params);

        dispatch(setMediaSoupState({ prop: "consumerTransport", value: consumerTransport }));

        consumerTransport.on("connect", async ({ dtlsParameters }: { dtlsParameters: mediasouptypes.DtlsParameters }, callback: Function, errback: Function) => {

          try {

            socketIo.emit("transport-recv-connect", { dtlsParameters, serverConsumerTransportId: params.id })

            callback();

          } catch (err: any) {

            console.log(err);

          }

        });



        connectRecvTransport(consumerTransport, remoteProducerId, params.id);



      });



    } catch (err: any) {

      console.log(err);

    }

  }







  const getProducers = () => {

    try {

      socketIo?.emit("getProducers", ({ producersList }: { producersList: string[] }) => {

        console.log(producersList, 'producerIdsproducerIds');

        producersList.forEach((producerId: string) => {

          dispatch(setMediaSoupState({ prop: "producerIds", value: producerId }));

        });

      });

    } catch (err: any) {

      console.log(err);

    }


  }



  const connectRecvTransport = async (consumerTransport: mediasouptypes.Transport, remoteProducerId: string, serverConsumerTransportId: string) => {

    try {

      socketIo.emit("consume", { producerId: remoteProducerId, rtpCapabilities: mediaSoupStateProps.device.rtpCapabilities, serverConsumerTransportId }, async ({ params }: any) => {

        const consumer = await consumerTransport.consume({

          kind: params.kind,
          id: params.id,
          producerId: params.producerId,
          rtpParameters: params.rtpParameters

        })


        const { track } = consumer

        dispatch(setMediaSoupState({ prop: "streamTracks", value: track }))

        socketIo.emit("consumer-resume", { consumerId: params.id })


      });

    } catch (err: any) {

      console.log(err);

    }


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

export default MultiPartyConversation