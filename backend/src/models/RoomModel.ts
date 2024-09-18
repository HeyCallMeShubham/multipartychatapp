
import { Schema, InferSchemaType, model } from "mongoose";



enum roomStatus {

    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    CLOSED = "CLOSED"

}



const roomSchema = new Schema({

    roomId: { type: String, required: true },
    roomDescription: { type: String },
    roomMembers: [{ userEmail: String, isAdmin: Boolean, }],
    roomAdmins: [{ userEmail: String, isAdmin: Boolean }],
    suspendedUsers: [{ userEmail: String, userName: String, isSuspended: Boolean, }],
    creatorOfRoom: { userEmail: String, userName: String },
    roomStatus: { type: String, enum: roomStatus, default: roomStatus.INACTIVE }

}, { timestamps: true });





type MultipartyRoom = InferSchemaType<typeof roomSchema>



export default model<MultipartyRoom>("Multipartyroom", roomSchema)


