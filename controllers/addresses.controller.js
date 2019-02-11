const AddressDto = require('../dtos/responses/address.dto');
const AppResponseDto = require('../dtos/responses/app_response.dto');
const Address = require('../models/address.model');
const Utils = require('../utils/obj_functions');

exports.getAddresses = function (req, res, next) {
    return Promise.all([
        Address.find({user: req.user})
            .limit(Number(req.pageSize))
            .skip(Number((req.page - 1) * req.pageSize))
            .sort({createdAt: 'desc'})
            .exec(),
        Address.count({user: req.user}).exec(),
    ]).then(function (results) {
        const addresses = results[0];
        const addressesCount = results[1];

        return res.json(AddressDto.buildPagedList(addresses, req.page, req.pageSize, addressesCount, req.baseUrl));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.createAddress = function (req, res, next) {

    const errors = {};

    const firstName = req.body.first_name || req.user.firstName;
    const lastName = req.body.zipCode || req.user.lastName;
    const zipCode = req.body.zip_code;
    const address = req.body.address;
    const city = req.body.city;
    const country = req.body.country;

    if (!city || city.trim() === '')
        errors.firstName = 'city is required';

    if (!country || country.trim() === '')
        errors.lastName = 'country is required';

    if (!zipCode || zipCode.trim() === '')
        errors.email = 'zipCode is required';

    if (!address || address.trim() === '')
        errors.password = 'Password must not be empty';

    if (!Utils.isEmpty(errors)) {
        // return res.status(422).json({success: false, errors});
        return res.status(422).json(AppResponseDto.buildWithErrorMessages(errors));
    }

    const addr = new Address({
        firstName: firstName,
        lastName: lastName,
        city, country, address, zipCode,
        user: req.user
    });
    req.user.addresses.push(addr);
    Promise.all([addr.save(), req.user.save()]).then(results => {
        const address = results[0];
        return res.json(AppResponseDto.buildWithDtoAndMessages(AddressDto.buildDto(address), 'Address added successfully'));
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages('error saving address'));
    });

};

exports.getAddressesDetails = function (req, res, next) {

    return req.order.populate({
        path: 'address',
        populate: {
            path: 'user',
            model: 'User'
        },
    }).execPopulate().then(function (product) {
        return res.json({
            comments: req.product.comments.map(function (comment) {
                return comment.toJson(user);
            })
        });
    }).catch(err => {
        return res.json(AppResponseDto.buildWithErrorMessages(err));
    });
};

exports.updateComment = (req, res, next) => {
    return res.json({message: 'not implemented'});
};