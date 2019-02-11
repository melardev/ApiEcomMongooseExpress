const UsersDto = require("../dtos/responses/users.dto");
const AppResponseDto = require("../dtos/responses/app_response.dto");
const User = require('../models/user.model');

const isEmpty = function (obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
};


exports.login = function (req, res, next) {
    // If we land here it means passport has authenticated
    // the user succesfully so now we pass the token back
    return res.json(UsersDto.loginSuccess(req.user));
};

exports.register = function (req, res, next) {

    // validations

    const errors = {};

    const email = req.body.email;
    const password = req.body.password;
    const password_confirmation = req.body.password_confirmation;
    const username = req.body.username;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;

    // validate form
    if (!username || username.trim() === '')
        errors.username = 'Username is required';

    if (!firstName || firstName.trim() === '')
        errors.firstName = 'firstName is required';

    if (!lastName || lastName.trim() === '')
        errors.lastName = 'lastName is required';

    if (!email || email.trim() === '')
        errors.email = 'Email is required';

    if (!password || password.trim() === '')
        errors.password = 'Password must not be empty';

    if (password_confirmation !== password)
        errors.password_confirmation = 'Confirmation password must not be empty';

    if (!isEmpty(errors)) {
        // return res.status(422).json({success: false, errors});
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(errors));
    }

    return User.findOne({
        $or: [{
            'username': username // should I replace it with RegExp?
        }, {
            'email': new RegExp(["^", email, "$"].join(""), "i")
        }]
    }).then(user => {

        if (user !== null) {
            // If the user exists, return Error
            if (user.username === username)
                errors.username = 'username: ' + username + ' is already taken';

            if (user.email === email)
                errors.email = 'Email: ' + email + ' is already taken';

            if (!isEmpty(errors)) {
                return res.status(403).json(AppResponseDto.buildWithErrorMessages(errors));
            }
        }
        user = new User({
            firstName: firstName,
            lastName: lastName,
            email: email,
            username: username,
            password: password
        });

        user.save().then(user => {
            if (user) {
                console.dir(user);
                console.log(user.toJSON());
                res.json(UsersDto.registerDto(user));
            } else {
                console.log('user is empty ...???');
                res.json(AppResponseDto.buildWithErrorMessages('something went wrong'));
            }
        }).catch(err => {
            throw err
        });
    }).catch(err => {
        console.error(err);
        // res.status(500).json({success: false, error: user});
        res.status(500).json({
            success: false,
            full_messages: err
        });
    });
};