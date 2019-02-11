const CommentDto = require('../dtos/responses/comments.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');
const Comment = require('../models/comment.model');

exports.getByProductSlug = function (req, res, next) {

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;

    return Promise.all([
        Comment.find({product: req.product})
            .limit(Number(pageSize))
            .skip(Number((page - 1) * pageSize))
            .sort({createdAt: 'desc'})
            .populate('user', 'username')
            .exec(),
        Comment.count({product: req.product}).exec(),
    ]).then(function (results) {
        const comments = results[0];
        const commentsCount = results[1];

        return res.json(CommentDto.buildPagedList(comments, page, pageSize, commentsCount, req.baseUrl, true));
    }).catch(next);
};

// create a new comment
exports.createComment = function (req, res, next) {
    const commentObj = {};
    if (req.body.content) {
        commentObj.content = req.body.content;
    }

    if (req.body.rating) {
        let rating = parseInt(req.body.rating);
        rating = Math.min(rating, 5); // rating must be at most 5
        rating = Math.max(rating, 1); // rating must be at least 1
        commentObj.rating = rating;
    }

    const comment = new Comment(commentObj);
    comment.product = req.product;
    comment.user = req.user;

    return comment.save().then(comment => {
        // Bidirectional relationship
        if (comment.user.comments == null)
            comment.user.comments = [comment];
        else
            comment.user.comments.push(comment);
        comment.user.save().then(user => {
            res.json(CommentDto.buildDetails(comment));
        });
    }).catch(next);
};

exports.getCommentDetails = function (req, res, next) {
    Promise.resolve(req.payload ? User.findById(req.payload.id) : null).then(function (user) {
        return req.product.populate({
            path: 'comments',
            populate: {
                path: 'user'
            },
            options: {
                sort: {
                    created_at: 'desc'
                }
            }
        }).execPopulate().then(function (product) {
            return res.json({
                comments: req.product.comments.map(function (comment) {
                    return comment.toJson(user);
                })
            });
        });
    }).catch(next);
};

exports.deleteComment = function (req, res, next) {
    // req.product.comments.remove(req.comment._id);
    // There is no CASCADE on mongo, so delete manually the entries from both sides
    // Delte from products.comments
    if (typeof req.product !== 'undefined')
        req.product.comments.remove(req.comment._id);
    return Promise.all([
        req.comment.delete(), // req.comment.remove().exec()
        typeof req.product !== 'undefined' ? req.product.save() : null
    ]).then(result => {
        return res.json(AppResponseDto.buildSuccessWithMessages('comment removed successfully'));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('Error ' + err));
    });
};


exports.updateComment = (req, res, next) => {

    if (req.body.content) {
        req.comment.content = req.body.content;
    }

    if (req.body.rating) {
        let rating = parseInt(req.body.rating);
        rating = Math.min(rating, 5); // rating must be at most 5
        rating = Math.max(rating, 1); // rating must be at least 1
        req.comment.rating = rating;
    }

    return req.comment.save().then(comment => {
        res.json(CommentDto.buildDetails(comment));
    }).catch(next);
};