const TagDto = require('../dtos/responses/tags.dto');
const CategoryDto = require('../dtos/responses/categories.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');
const AppDto = require('../dtos/responses/app_response.dto');
const Product = require('../models/product.model');
const Tag = require('../models/tag.model');
const Category = require('../models/category.model');
const FileUpload = require('../models/file_upload.model');


exports.getTags = function (req, res, next) {

    return Promise.all([
        Tag.find({})
            .limit(Number(req.pageSize))
            .skip(Number((req.page - 1) * req.pageSize))
            .sort({createdAt: 'desc'})
            .populate('images')
            .exec(),
        Tag.count().exec(),
    ]).then(function (results) {
        const tags = results[0];
        const tagsCount = results[1];

        return res.json(TagDto.buildPagedList(tags, req.page, req.pageSize, tagsCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.getCategories = function (req, res, next) {
    return Promise.all([
        Category.find({})
            .limit(Number(req.pageSize))
            .skip(Number((req.page - 1) * req.pageSize))
            .sort({createdAt: 'desc'})
            .populate('images')
            .exec(),
        Category.count().exec(),
    ]).then(function (results) {
        const categories = results[0];
        const categoryCount = results[1];
        return res.json(TagDto.buildPagedList(categories, req.page, req.pageSize, categoryCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createTag = function (req, res, next) {
    const tagObj = {};
    const promises = [];
    if (req.body.name) {
        tagObj.name = req.body.name;
    }

    if (req.body.description) {
        tagObj.description = req.body.description;
    }

    const tag = new Tag(tagObj);
    for (let i = 0; req.files != null && i < req.files.length; i++) {
        let file = req.files[i];
        let filePath = file.path.replace(new RegExp('\\\\', 'g'), '/');
        filePath = filePath.replace('public', '');
        let fileUpload = new FileUpload({
            fileName: file.filename,
            filePath: filePath,
            originalName: file.originalName,
            fileSize: file.size,
            tag,
        });

        tag.images.push(fileUpload);
        promises.push(fileUpload.save());
    }

    promises.push(tag.save());

    Promise.all(promises).then(results => {
        return res.json(AppDto.buildWithDtoAndMessages(TagDto.buildSummary(results.pop(), true), 'Tag created successfully'));
    }).catch(err => {
        return res.json(AppDto.buildWithErrorMessages("something went wrong"));
    });

};

exports.createCategory = function (req, res, next) {
    const categoryObj = {};
    const promises = [];
    if (req.body.name) {
        categoryObj.name = req.body.name;
    }

    if (req.body.description) {
        categoryObj.description = req.body.description;
    }

    const category = new Category(categoryObj);
    for (let i = 0; req.files != null && i < req.files.length; i++) {
        let file = req.files[i];
        let filePath = file.path.replace(new RegExp('\\\\', 'g'), '/');
        filePath = filePath.replace('public', '');
        let fileUpload = new FileUpload({
            fileName: file.filename,
            filePath: filePath,
            originalName: file.originalName,
            fileSize: file.size,
            category
        });

        category.images.push(fileUpload);
        promises.push(fileUpload.save());
    }

    promises.push(category.save());

    Promise.all(promises).then(results => {
        return res.json(AppDto.buildWithDtoAndMessages(CategoryDto.buildSummary(results[results.length - 1], true), 'Category created successfully'));
    }).catch(err => {
        return res.json(AppDto.buildWithErrorMessages("something went wrong"));
    });
};