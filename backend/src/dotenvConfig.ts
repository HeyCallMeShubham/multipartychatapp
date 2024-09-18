import dotenv from "dotenv";
import path from "path";




const dotenvConfig = () => {

    const result = dotenv.config({ path: path.resolve(__dirname, ".env") });

    if (result.error) {
        // Log the error and throw if the .env file is missing or there's another issue
        console.error("Failed to load .env file", result.error);
        throw result.error;
    }

    return result;

}





export { dotenvConfig };





