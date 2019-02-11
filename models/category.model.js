const mongoose = require('mongoose');
const slug = require('slug');

const categorySchema = new mongoose.Schema({
    name: {type: String},
    slug: {type: String, unique: true, required: true},
    description: {type: String},
    images: [{type: mongoose.Schema.Types.ObjectId, ref: 'FileUpload'}],
    products: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
});

categorySchema.pre('validate', function (next) {
    this.slug = slug(this.name);
    next();
});

categorySchema.statics.findOneOrCreateWith = async function findOneOrCreateWith(condition, doc) {
    const one = await this.findOne(condition);

    return one || this.create(doc);
};

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;