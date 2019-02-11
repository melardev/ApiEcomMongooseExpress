const OrderDto = require('../dtos/responses/orders.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');

const Order = require('../models/order.model').Order;
const Product = require('../models/product.model');
const Address = require('../models/address.model');
const OrderItem = require('../models/order_item.model');

exports.getOrders = function (req, res, next) {
    return Promise.all([
        Order.find({user: req.user})
            .limit(Number(req.pageSize))
            .skip(Number((req.page - 1) * req.pageSize))
            .sort({createdAt: 'desc'})
            .populate('address')
            .exec(),
        Order.count({user: req.user}).exec(),
    ]).then(function (results) {
        const orders = results[0];
        const ordersCount = results[1];

        return res.json(OrderDto.buildPagedList(orders, req.page, req.pageSize, ordersCount, req.baseUrl, false, true));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

function createOrderWithAddress(res, cartItems, address, user) {
    const promises = [];
    const order = new Order({
        user: user, address: address
    });

    if (user != null) {
        user.orders.push(order);
    }

    Product.find().where('_id').in(cartItems.map(cartItem => cartItem.id)).then(products => {

        if (products.length !== cartItems.length)
            return res.json(AppResponseDto.buildWithErrorMessages('make sure the products are still available'));

        products.forEach((product, index) => {
            let orderItem = new OrderItem({
                name: product.name,
                slug: product.slug,
                price: product.price,
                user: user,
                quantity: cartItems[index].quantity,
                order: order
            });
            promises.push(orderItem.save());
            order.orderItems.push(orderItem);
        });

        promises.push(address.save());
        if (user != null)
            promises.push(user.save());
        promises.push(order.save());

        Promise.all(promises).then(async results => {
            const order = results.pop();
            return res.json(OrderDto.buildDto(order, false, true, true));
        }).catch(err => {
            return AppResponseDto.buildWithErrorMessages('Error');
        });
    });
}

exports.createOrder = async function (req, res, next) {
    const addressId = req.body.address_id;
    if (req.user != null && addressId != null) {
        Address.findById(addressId).populate('user', '_id')
            .then(address => {
                // if address does not exist, or address exist but it was from a guest user, or exists and belongs to another user
                if (!address || !address.user || address.user.id !== req.user.id)
                    return res.status(401).json(AppResponseDto.buildWithErrorMessages('You do not own this address'));
                else {
                    return createOrderWithAddress(res, req.body.cart_items, address, req.user);
                }
            }).catch(err => {
            throw err;
        });
    } else if (addressId == null) {

        const country = req.body.country;
        const city = req.body.city;
        const firstName = req.body.first_name;
        const lastName = req.body.last_name;
        const address = req.body.address;

        const addr = new Address({
            country, city, firstName, lastName, address
        });
        if (req.user != null) {
            addr.user = req.user;
            req.user.addresses.push(addr);
        }
        return createOrderWithAddress(res, req.body.cart_items, addr, req.user);
    }

};

exports.getOrderDetails = function (req, res, next) {

    return Promise.all([
        // populate address, and his user(even though the users' address info is not output in this response
        req.order.populate({
            path: 'address',
            populate: {
                path: 'user',
                model: 'User'
            },
        }).execPopulate(),
        // Load order items
        OrderItem.find({order: req.order})
    ]).then(results => {
        const order = results[0];
        order.orderItems = results[1];
        return res.json(OrderDto.buildSummary(order, true, true, true));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.updateComment = (req, res, next) => {
    return res.json({message: 'not implemented'});
};
