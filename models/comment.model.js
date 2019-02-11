const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    content: {type: String, required: true},
    rating: {type: Number, required: false},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
}, {timestamps: true});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;