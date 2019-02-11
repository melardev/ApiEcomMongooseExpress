const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address: {type: String},
    city: {type: String},
    country: {type: String},
    zipCode: {type: String},
    firstName: {type: String},
    lastName: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}],
});

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
