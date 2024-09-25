import { Action, createSlice, PayloadAction, Slice } from "@reduxjs/toolkit";
import { types as mediasoupTypes } from "mediasoup-client"
import { RtpCapabilities } from "mediasoup-client/lib/RtpParameters";
import { RootState } from "../app/store";

interface initialStateType {

    routerRtpCapabilities: RtpCapabilities | undefined,
    streamTracks: any[] | undefined,
    device: mediasoupTypes.Device | undefined,
    producerTransport: mediasoupTypes.Transport | undefined,
    consumerTransport: mediasoupTypes.Transport | undefined,
    consumingTransports: any[] | undefined,
    consumerTransports: any[] | undefined,
    producerIds: string[] | undefined,
    consumer: mediasoupTypes.Consumer | undefined,
    audioParams: any,
    videoParams: any ,
    audioProducer: any | undefined,
    videoProducer: any | undefined,
    isProducer: boolean | undefined,

}



const initialState: initialStateType = {


    routerRtpCapabilities: undefined,
    streamTracks: [],
    device: undefined,
    producerTransport: undefined,
    consumerTransport: undefined,
    consumerTransports: [],
    consumingTransports: [],
    producerIds: [],
    consumer: undefined,
    audioParams: undefined,
    videoParams: {

        encodings:
            [
                { maxBitrate: 100000 },
                { maxBitrate: 300000 },
                { maxBitrate: 900000 }
            ],
        codecOptions:
        {
            videoGoogleStartBitrate: 1000
        }

    },
    audioProducer: undefined,
    videoProducer: undefined,
    isProducer: undefined,


}



const mediasoupSlice: Slice = createSlice({

    name: "mediasoupSlice",
    initialState,
    reducers: {

        setMediaSoupState: (state, action: PayloadAction<{ prop: keyof initialStateType; value: any }>) => {

            const { prop, value } = action.payload;

            if (prop === "producerIds" || prop === "streamTracks" || prop === "consumingTransports" || prop === "consumerTransports") {

                state[prop].push(value);

            } else {

                state[prop] = value

            }


        }

    }

});





export const { setMediaSoupState } = mediasoupSlice.actions


export default mediasoupSlice.reducer


