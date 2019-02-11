const ProductListDto = require("../dtos/responses/products.dto");
const AppResponseDto = require("../dtos/responses/app_response.dto");

const Comment = require('../models/comment.model');
const Product = require('../models/product.model');
const Tag = require('../models/tag.model');
const FileUpload = require('../models/file_upload.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const _ = require('lodash');

exports.index = function (req, res, next) {

    return Promise.all([
        Product.find({})
            .limit(Number(req.pageSize))
            .skip(Number((req.page - 1) * req.pageSize))
            .sort({createdAt: 'desc'})
            .populate('tags', 'name')
            .populate('categories', 'name')
            .populate('images', 'filePath')
            .exec(),
        Product.count().exec(),
        Product.aggregate().project({
            comments: {
                $size: "$comments"
            }
        })
    ]).then(function (results) {
        const products = results[0];
        // we could also retrieve productsCount with commentsCountArray.length
        const productsCount = results[1];
        let commentsCountArray = results[2];
        // Now let's retrieve the appropriate comments count for the req.pageSize products loaded
        // the first approach is the most readable:
        const offset = (req.page - 1) * req.pageSize;
        commentsCountArray = commentsCountArray.reverse().slice(offset, req.pageSize);

        // the second approach I think is better from performance(it is not a really big deal...) but less readable:
        // const offset = (productsCount - req.pageSize) - ((req.page - 1) * req.pageSize);
        // commentsCountArray = commentsCountArray.slice(offset, offset + req.pageSize).reverse();
        return res.json(ProductListDto.buildPagedList(products, commentsCountArray, req.page, req.pageSize, productsCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};


exports.getByTagId = function (req, res, next) {
    const query = {tags: {"$in": [req.params.tag_name]}};
    const pageSize = parseInt(req.query.page_size) || 5;
    const page = parseInt(req.query.page) || 1;
    Promise.all([
        Product.find(query)
            .limit(Number(pageSize))
            .skip(Number(pageSize * (page - 1)))
            .sort({created_at: 'desc'})
            .populate('user').populate('tags', 'name').populate('categories', 'name').exec(),
        Product.count(query).exec()
    ]).then(function (results) {
        const products = results[0];
        const productsCount = results[1];
        return res.json(ProductListDto.buildPagedList(products, page, pageSize, productsCount, ''));
    }).catch(next);
};

exports.getByTag = function (req, res, next) {
    Tag.findOne({name: req.params.tag_name}).then(tag => {
        const query = {tags: {"$in": [tag.id]}};
        const pageSize = parseInt(req.query.page_size) || 5;
        const page = parseInt(req.query.page) || 1;
        Promise.all([
            Product.find(query)
                .limit(Number(pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({created_at: 'desc'})
                .populate('user').populate('tags', 'name').populate('categories', 'name').exec(),
            Product.count(query).exec()
        ]).then(function (results) {
            const products = results[0];
            const productsCount = results[1];
            return res.json(ProductListDto.buildPagedList(products, page, pageSize, productsCount, ''));
        }).catch(next);
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('something went wrong ' + err))
    });

};

exports.getByCategoryId = function (req, res, next) {
    const query = {categories: {"$in": [req.params.category_name]}};
    const pageSize = parseInt(req.query.page_size) || 5;
    const page = parseInt(req.query.page) || 1;

    Promise.all([
        Product.find(query)
            .limit(Number(req.pageSize))
            .skip(Number(pageSize * (page - 1)))
            .sort({created_at: 'desc'})
            .populate('user').populate('tags').populate('categories')
            .exec(),
        Product.count(query).exec()
    ]).then(function (results) {
        const products = results[0];
        const productsCount = results[1];
        return res.json(ProductListDto.buildPagedList(products, page, pageSize, productsCount, ''));
    }).catch(next);
};

exports.getByCategory = function (req, res, next) {
    Category.findOne({name: req.params.category_name}).then(category => {
        const query = {categories: {"$in": [category.id]}};
        const pageSize = parseInt(req.query.page_size) || 5;
        const page = parseInt(req.query.page) || 1;

        Promise.all([
            Product.find(query)
                .limit(Number(req.pageSize))
                .skip(Number(pageSize * (page - 1)))
                .sort({created_at: 'desc'})
                .populate('user').populate('tags').populate('categories')
                .exec(),
            Product.count(query).exec()
        ]).then(function (results) {
            const products = results[0];
            const productsCount = results[1];
            return res.json(ProductListDto.buildPagedList(products, page, pageSize, productsCount, ''));
        }).catch(next);
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('Something is wrong' + err));
    });

};

exports.getByIdOrSlug = function (req, res, next) {
    return Promise.all([
        req.product
            .populate('tags', 'name')
            .populate('categories', 'name')
            .populate('comments')
            .populate({ // populate nested ref
                path: 'comments',
                populate: {
                    path: 'user',
                    model: 'User'
                }
            })
            .execPopulate(),
        Comment.find({product: req.product}).populate('user').exec()
    ]).then(results => {
        const product = results[0];
        product.comments = results[1];
        return res.json(ProductListDto.buildDetails(product, true));

    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createProduct = async function (req, res, next) {

    const promises = [];
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;

    const product = new Product({
        name, description, price
    });

    const images = req.files;


    _.forOwn(req.body.tags ? req.body.tags : [], async (description, name) => {
        promises.push(Tag.findOneOrCreateWith({name}, {
            name,
            description,
        }));
    });

    _.forOwn(req.body.categories ? req.body.categories : [], async (description, name) => {
        promises.push(Category.findOneOrCreateWith({name}, {
            name,
            description,
        }));
    });

    Promise.all(promises).then(results => {
        promises.length = 0;

        results.forEach(tagOrCategory => {
            if (tagOrCategory.__proto__.collection.name === 'tags') {
                if (product.tags.indexOf(tagOrCategory.id) === -1)
                    product.tags.push(tagOrCategory);

                if (tagOrCategory.products.indexOf(product.id) === -1) {
                    tagOrCategory.products.push(product);
                    promises.push(tagOrCategory.save());
                }
            } else if (tagOrCategory.__proto__.collection.name === 'categories') {

                if (product.categories.indexOf(tagOrCategory.id) === -1)
                    product.categories.push(tagOrCategory);

                if (tagOrCategory.products.indexOf(product.id) === -1) {
                    tagOrCategory.products.push(product);
                    promises.push(tagOrCategory.save());
                }
            }
        });


        for (let i = 0; i < images.length; i++) {
            let file = images[i];
            let filePath = file.path.replace(new RegExp('\\\\', 'g'), '/');
            filePath = filePath.replace('public', '');
            let fileUpload = new FileUpload({
                fileName: file.filename,
                filePath: filePath,
                originalName: file.originalName,
                fileSize: file.size
            });

            fileUpload.product = product;
            product.images.push(fileUpload);
            promises.push(fileUpload.save());
        }

        promises.push(product.save());
        Promise.all(promises).then(results => {
            const product = results.pop();
            return res.json(ProductListDto.buildDetails(product));
        }).catch(err => {
            return res.json(AppResponseDto.buildWithErrorMessages('error on saving product'));
        });


    }).catch(err => {

    });
};