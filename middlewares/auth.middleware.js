const passport = require('passport');
const jwtAuthenticate = passport.authenticate('jwt', {session: false});
const AppResponseDto = require('../dtos/responses/app_response.dto');

const isAdmin = (req, res, next) => {
    if (req.user == null)
        return res.json(AppResponseDto.buildWithErrorMessages('Access denied, you re not Logged In'));

    if (req.user.isAdmin())
        next();
    else
        return res.json(AppResponseDto.buildWithErrorMessages('Access denied, you re not an Admin'));
};

function isAuthenticated(req, res, next) {
    if (req.user != null) {
        next();
        return;
    }
    return res.json(AppResponseDto.buildWithErrorMessages('Permission denied, you must be authenticated'))
};

function userOwnsItOrIsAdmin(req, res, next) {
    if (req.user != null && (req.user.isAdmin() || req.userOwnable.user._id.toString() === req.user.id.toString()))
        next();
    else
        return res.json(AppResponseDto.buildWithErrorMessages('This resource does not belong to you'));
}

function readToken(req, res, next) {
    if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')
        && req.headers.authorization.split(' ')[0] === 'Bearer' ||
        req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') {
        req.jwt = req.headers.authorization.split(' ')[1];
        next();
    } else {
        return next();
    }
}

function getUser(required) {
    return (req, res, next) => {
        if (req.jwt == null) {
            if (required) // no jwt, and it is required
                return res.json(AppResponseDto.buildWithErrorMessages('Permission denied'));
            else // no jwt, but it is not required
                return next();
        } else {
            // valid user required, authenticate through password, the callback set up in passport.config will set req.user
            return jwtAuthenticate(req, res, next);
        }
    }

}

module.exports = {
    userOwnsItOrIsAdmin, isAdmin, loadUser: [readToken, getUser(false)], isAuthenticated
};