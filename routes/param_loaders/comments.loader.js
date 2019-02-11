const Comment = require('../../models/comment.model');
const AppResponseDto = require('../../dtos/responses/app_response.dto');

function init(router) {
    router.param('comment', function (req, res, next, id) {
        Comment.findById(id).then(function (comment) {
            if (!comment)
                return res.json(AppResponseDto.buildWithErrorMessages('Comment not found'), 404);

            req.comment = comment;
            return next();
        }).catch(next);
    });


    router.param('comment_id', function (req, res, next, id) {
        Comment.findById(id).then(function (comment) {
            if (!comment) {
                return res.json(AppResponseDto.buildWithErrorMessages('Comment not found'), 404);
            }
            req.userOwnable = comment;
            req.comment = comment;
            next();
        }).catch(next);
    });
};

module.exports = {
    init
};