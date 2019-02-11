const mongoose = require('mongoose');
const slug = require('slug');

const ProductSchema = new mongoose.Schema({
    name: {type: String, required: [true, 'Name must not be emtpy']},
    slug: {type: String, lowercase: true, unique: true, required: true},
    price: {type: Number, required: true},
    description: {type: String, required: true},
    views: {type: Number, default: 0},
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
    categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'Category'}],
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    images: [{type: mongoose.Schema.Types.ObjectId, ref: 'FileUpload'}],
}, {timestamps: true});

ProductSchema.pre('validate', function (next) {
    if (!this.slug) {
        this.slugify();
    }
    next();
});

ProductSchema.methods.slugify = function () {
    this.slug = slug(this.name) + '-' + (Math.random() * Math.pow(36, 6) | 0).toString(36);
};

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;