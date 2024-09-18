
import express, { Express } from "express";
import asyncHandler from "./AsyncHandler";
import { server } from "typescript";
import path from "path"
import https from "https"
import fs from "fs"
import { Server } from "socket.io";

const app: Express = express();





interface IHttpsOptions {
    key: Buffer,
    cert: Buffer
}



const getCertOptions = (): IHttpsOptions | null => {
    try {
        const key = fs.readFileSync(path.resolve(__dirname, "../../certs/cert.key"));
        const cert = fs.readFileSync(path.resolve(__dirname, "../../certs/cert.crt"));
        return { key, cert };
    } catch (err) {
        console.error("Error reading SSL certificate files:", err);
        return null;
    }
}



const httpOptions = getCertOptions();
if (!httpOptions) {
    throw new Error("Failed to load SSL certificate files. Server cannot start.");
}







const useExpressAppAndHttpsServer = (): { app: Express, httpsServer: any, expressServer: any } => {


    const httpsServer: https.Server = https.createServer(httpOptions, app);

    const expressServer = httpsServer.listen(process.env.PORT || 4500, () => {

        console.log(`listening on port number ${process.env.PORT}`)

    });

    return { app, httpsServer, expressServer }

}



export { useExpressAppAndHttpsServer }






