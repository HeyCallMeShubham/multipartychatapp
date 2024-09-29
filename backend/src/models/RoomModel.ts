
import { Schema, InferSchemaType, model } from "mongoose";



enum roomStatus {

    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    CLOSED = "CLOSED"

}



const roomSchema = new Schema({

    roomId: { type: String, required: true },
    roomMembers: [{ userEmail: String, isAdmin: Boolean, }],
    roomAdmin: { userEmail: String, isAdmin: Boolean },
    creatorOfRoom: { type: Schema.Types.ObjectId, ref: "MultipartyChatUser" },
    roomStatus: { type: String, enum: roomStatus, default: roomStatus.INACTIVE }

}, { timestamps: true });





type MultipartyRoom = InferSchemaType<typeof roomSchema>



export default model<MultipartyRoom>("MultipartyChatroom", roomSchema)


