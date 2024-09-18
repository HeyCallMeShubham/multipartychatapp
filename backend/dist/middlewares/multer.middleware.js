"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadDir = path_1.default.join(__dirname, '../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, callback) {
        console.log(req.body, 'reqbodyindestination');
        return callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
        console.log(req.body, 'reqbodyinfilename');
        return callback(null, Date.now() + file.originalname);
    }
});
exports.upload = (0, multer_1.default)({ storage: storage });
