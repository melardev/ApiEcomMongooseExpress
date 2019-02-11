const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'JWT_SUPER_SECRET';
const Role = require('./role.model');
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z]+$/, 'is invalid'],
    },
    lastName: {
        type: String,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z]+$/, 'is invalid'],
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        index: true
    },
    username: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/^[a-zA-Z0-9]+$/, 'is invalid'],
        index: true
    },
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
    addresses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Address'}],
    comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}],
    orders: [{type: mongoose.Schema.Types.ObjectId, ref: 'Order'}],
    password: {type: String, required: true},
}, {timestamps: true});


UserSchema.path('password', {
    // custom password setter, after doing this, password field is no longer a string, but an object, to retrieve the string value
    // we can this.password.toObject() or this.get('password')
    set: function (password) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        return hashedPassword;
    }
});

UserSchema.pre('save', function (next) {
    const user = this;
    if (user.roles != null && user.roles.length > 0)
        next();
    else {
        Role.findOne({name: 'ROLE_USER'}).then(role => {
            user.roles = [role];
            next();
        }).catch(err => {
            next(err);
        });
    }
});

UserSchema.methods.isValidPassword = function (candidatePassword, callback) {
    // Since we used path('password') now password is no longer a simple string, but an object, to access its value we can:
    // bcrypt.compareSync(candidatePassword, this.get('password'))
    bcrypt.compare(candidatePassword, this.password.toObject(), function (err, isMatch) {
        if (err)
            return callback(err);
        callback(null, isMatch);
    })
};

UserSchema.methods.generateJwt = function () {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        user_id: this._id,
        username: this.username,
        roles: this.roles.map(role => role.name),
        exp: parseInt(exp.getTime() / 1000),
    }, secret);
};

UserSchema.methods.isAdmin = function () {
    return !!this.roles.find(r => r.name === 'ROLE_ADMIN');
};

const User = mongoose.model('User', UserSchema);
module.exports = User;