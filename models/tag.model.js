const mongoose = require('mongoose');
const slug = require('slug');

const tagSchema = new mongoose.Schema({
    name: {type: String},
    slug: {type: String, unique: true},
    description: {type: String},
    images: [{type: mongoose.Schema.Types.ObjectId, ref: 'FileUpload'}],
    products: [{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
});

tagSchema.pre('validate', function (next) {
    this.slug = slug(this.name);
    next();
});

tagSchema.statics.findOneOrCreateWith = async function findOneOrCreateWith(condition, doc) {
    const one = await this.findOne(condition);

    return one || this.create(doc);
};

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;