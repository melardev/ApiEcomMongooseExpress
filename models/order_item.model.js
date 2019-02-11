const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    name: {type: String, required: [true, 'Name must not be emtpy']},
    slug: {type: String, required: [true, 'Slug must not be emtpy']},
    price: {type: String, required: [true, 'Price must not be emtpy']},
    quantity: {type: Number, required: [true, 'Quantity must not be empty']},
    order: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {timestamps: true});

const OrderItem = mongoose.model('OrderItem', OrderItemSchema);
module.exports = OrderItem;