const User = require('../models/user.model');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

module.exports = function (passport) {

    // will be used
    const localLogin = new LocalStrategy({
        usernameField: 'username', // By default passport looks for username, change that setting to email if you want or other
        passwordField: 'password'
    }, function (username, password, done) {

        // User can sign in with email or usernae, BUT, he must provide "email" param
        // in the POST request

        User.findOne({
            $or: [{
                'username': username // should I replace it with RegExp?
            }, {
                'email': new RegExp(["^", username, "$"].join(""), "i")
            }]
        }).populate('roles').exec(function (err, user) {

            if (err) return done(err);

            if (user) {
                user.isValidPassword(password, function (err, valid) {
                    if (err) return done(err);
                    if (!valid)
                        return done(null, false);

                    if (valid)
                        return done(null, user);
                });
            } else {
                return done(null, false);
            }
        });
    });

    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        //jwtFromRequest: ExtractJwt.fromHeader('Autorization'),
        //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // considers Authorization::Bearer Header
        //jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Token'), // considers Authorization::Token Header
        secretOrKey: process.env.JWT_SECRET || 'JWT_SUPER_SECRET'
    };

    // The strategy to be used involves Jwt so -> JwtStrategy
    // We instruct the strategy where to look for JWT so it can parse it, and validate
    const jwtLogin = new JwtStrategy(jwtOptions, function (decodedPayload, done) {
        // If we are here it means the Token was validated successfully
        // Check if that user_id is in the database
        // The payload is the JWT payload as javascript object, it contains the fields we issued in jwt-users.controller::generateToken
        User.findById(decodedPayload.user_id).populate('roles').then(user => {
            // That user was found
            if (user)
                done(null, user);
            else // Not found
                done(null, false);
        }).catch(err => {
            return done(err, false);
        });
    });


    // Use Local Login for username/password Login, then ...
    passport.use(localLogin);
    // Once we are logged in and received a JWT the user will send it each request
    // passport will validate that token
    passport.use(jwtLogin);
};