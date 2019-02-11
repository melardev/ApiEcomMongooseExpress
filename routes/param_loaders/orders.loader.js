const mongoose = require('mongoose');
const Order = require('../../models/order.model').Order;
const AppResponseDto = require('../../dtos/responses/app_response.dto');

function init(router) {
    router.param('order_id', function (req, res, next) {
        //Product.findById(req.params.order_id)
        // Order.findOne({_id: mongoose.Types.ObjectId(req.params.order_id)})
        Order.findById(req.params.order_id)
            .populate('user')
            .then(function (order) {
                if (!order)
                    return res.json(AppResponseDto.buildWithErrorMessages('Order not found'), 404);
                req.order = order;
                req.userOwnable = order;
                return next();
            }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages(err), 404);
        });
    });
}

module.exports = {
    init
};