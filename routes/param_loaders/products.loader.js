const mongoose = require('mongoose');
const Product = require('../../models/product.model');
const AppResponseDto = require('../../dtos/responses/app_response.dto');

function init(router) {
    // Preload product objects on routes with ':product'
    router.param('product', function (req, res, next, slug) {
        Product.findOne({slug: slug})
            .then(function (product) {
                if (!product) {
                    //return res.sendStatus(404);
                    return res.json(AppResponseDto.buildWithErrorMessages('Product not found'), 404);
                }
                req.product = product;
                return next();
            }).catch(next);
    });

    // TODO: not working
    // place the product in the request object when :product_id is present in path
    router.param('product_id', function (req, res, next, id) {
        // id is also retrievable through req.params.product_id
        const objId = new mongoose.Types.ObjectId(id);
        new Promise((resolve, reject) => {
            Product.findById(id).then(function (product) {
                if (product !== null) {
                    resolve(product);
                    return;
                }
                reject('Product Not found');
            });
        }).then(product => {
            req.product = product;
            return next();
        }).catch(err => {
            return res.json({
                success: false,
                errors: {full_messages: [err]}
            }, 404);
        });
    });
}

module.exports = {
    init
};