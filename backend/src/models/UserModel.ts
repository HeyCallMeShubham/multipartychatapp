
import { Schema, InferSchemaType, model } from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import { NextFunction } from "express";



interface IMultipartyChatUser extends Document {
    fullName: string;
    userName: string;
    email: string;
    profileImage: string;
    password: string;
    refreshToken: string
}





const MultipartychatUserSchema = new Schema<IMultipartyChatUser>({

    fullName: { type: String, required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    profileImage: { type: String },
    password: { type: String, required: [true, "Password Is Required"] },
    refreshToken: { type: String }

}, { timestamps: true });





MultipartychatUserSchema.pre("save", async function (next) {

    // this pre("save") means before getting save in the db
    // this function or method will run 

    try {


        console.log(this.password, 'this.password');

        if (!this.isModified("password")) return next();

        const saltRounds = 12

        const salt = await bcrypt.genSalt(saltRounds);

        this.password = await bcrypt.hash(this.password, salt);

        next();

    } catch (err) {

        console.log(err);

    }


});



MultipartychatUserSchema.methods.isPasswordCorrect = async function (password: any) {

    try {

        console.log("passwordParam", password)
        console.log("thisPasswordParam", this.password)

        return await bcrypt.compareSync(password, this.password);



    } catch (err: any) {

        console.log(err);

    }


}



MultipartychatUserSchema.methods.generateAccessToken = async function () {

    try {

        const accessTokenSecretKey: any = process.env.JWT_ACCESS_TOKEN_SECRETKEY;

        const accessTokenExpiry: any = process.env.JWT_ACCESS_TOKEN_EXPIRY;



        return await jwt.sign({

            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName

        }, accessTokenSecretKey, { expiresIn: accessTokenExpiry });


    } catch (err: any) {

        console.log(err);

    }

}



MultipartychatUserSchema.methods.generateRefreshToken = async function () {

    try {

        const refreshTokenSecretKey: any = process.env.JWT_REFRESH_TOKEN_SECRETKEY;

        const refreshTokenExpiry: any = process.env.JWT_REFRESH_TOKEN_EXPIRY;



        return await jwt.sign({

            _id: this._id,
            email: this.email,
            userName: this.userName,
            fullName: this.fullName

        }, refreshTokenSecretKey, { expiresIn: refreshTokenExpiry });



    } catch (err: any) {

        console.log(err);

    }

}



MultipartychatUserSchema.post<IMultipartyChatUser>("save", function (doc) {

    // this post("save") means after getting save in the db
    // this function or method will run 

    console.log("this ran after getting saved in the db", doc, 'documentation');



});





type MultipartychatUserModel = InferSchemaType<typeof MultipartychatUserSchema>



export default model<MultipartychatUserModel>("MultipartyChatUser", MultipartychatUserSchema)




