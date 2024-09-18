"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ImageSchema = new mongoose_1.Schema({
    image: { type: String },
});
exports.default = (0, mongoose_1.model)("multipartyUsersImage", ImageSchema);
