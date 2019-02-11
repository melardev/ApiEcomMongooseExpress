const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true},
    description: {type: String},
    users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
});

roleSchema.statics.findOneOrCreateWith = async function findOneOrCreateWith(condition, doc) {
    const one = await this.findOne(condition);
    return one || this.create(doc);
};
const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
