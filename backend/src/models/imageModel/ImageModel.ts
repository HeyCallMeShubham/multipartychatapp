
import { Schema, InferSchemaType, model } from "mongoose"





const ImageSchema = new Schema({
    
    image: { type: String },

});



type ImageModel = InferSchemaType<typeof ImageSchema>



export default model<ImageModel>("multipartyUsersImage", ImageSchema)




