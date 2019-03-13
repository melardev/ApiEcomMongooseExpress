const Tag = require('../models/tag.model');
const PagesDto = require('../dtos/responses/pages.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto')
const Category = require('../models/category.model');

exports.index = (req, res, next) => {
    return Promise.all([
        Tag.find({})
            .limit(8)
            .skip(0)
            .sort({createdAt: 'desc'})
            .populate('images')
            .exec(),
        Category.find({})
            .limit(8)
            .skip(0)
            .sort({createdAt: 'desc'})
            .populate('images')
            .exec(),

    ]).then(function (results) {
        const tags = results[0];
        const categories = results[1];

        return res.json(AppResponseDto.buildSuccessWithDto(PagesDto.buildHome(tags, categories)));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};
