
import React, { MutableRefObject, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';


const RemoteStream = (stream: any) => {


    //const streams = useSelector((state: any) => state.streams);


    ///   useEffect(() => {

    /// console.log(streams.remoteStream, 'srrre');

    /// }, [streams.remoteStream]);


    const remoteStreamVideo: any = useRef<HTMLVideoElement | null>(null);


    //   useEffect(() => {

    /// if (streams.remoteStream) {

    ///   remoteStreamVideo.current.srcObject = streams.remoteStream?.stream

    ///  }
    ///
    /// }, [streams.remoteStream]);


    ///  const getUserMedia = async () => {

    ///   try {
    {/*
            
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            
            if (remoteStreamVideo.current) {

                remoteStreamVideo.current.srcObject = mediaStream
            }

        */}

    ///  } catch (err) {

    ///  console.log(err);

    ///  }

    ///  }



    /// useEffect(() => {

    ///getUserMedia();

    ///  }, []);



    useEffect(() => {


        remoteStreamVideo.current.srcObject = new MediaStream([stream.track])

    }, [stream])



    return (

        <video ref={remoteStreamVideo} playsInline autoPlay style={{ width: "100%", height: "99.6%", objectFit: "fill" }} />

    )
}




export default RemoteStream;



