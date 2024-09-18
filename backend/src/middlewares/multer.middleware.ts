import fs from 'fs';
import path from 'path';
import multer from "multer"


const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}



const storage = multer.diskStorage({

    destination: function (req, file, callback) {


        console.log(req.body, 'reqbodyindestination')
        return callback(null, uploadDir);

    },

    filename: function (req, file, callback) {

        console.log(req.body, 'reqbodyinfilename')
        return callback(null, Date.now() + file.originalname);

    }

});





export const upload = multer({ storage: storage });






