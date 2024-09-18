import React, { useEffect, useRef } from 'react'

const StreamVideo = ({stream}:any) => {

 

  

  const getMedia = async () => {

    try {

     //const stream: any = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

      //localStream.current.srcObject = stream;


    } catch (err) {

      console.log(err);

    }

  }





  useEffect(() => {

    getMedia();

  }, [stream]);



  return (

    <video className='stream' ref={stream} autoPlay playsInline></video>

  )
}

export default StreamVideo