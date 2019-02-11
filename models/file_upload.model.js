const mongoose = require('mongoose');

const FileUploadSchema = new mongoose.Schema({
    fileName: {type: String},
    filePath: {type: String},
    fileSize: {type: Number},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category'},
    tag: {type: mongoose.Schema.Types.ObjectId, ref: 'Tag'},
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    uploader: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

const FileUpload = mongoose.model('FileUpload', FileUploadSchema);
module.exports = FileUpload;