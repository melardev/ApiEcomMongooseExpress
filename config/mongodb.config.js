const mongoose = require('mongoose');
exports.configure = function () {
    mongoose.Promise = global.Promise;
    mongoose.set('debug', true);
    mongoose.connection.on('error', function (err) {
        console.error(err);
    });
    mongoose.connection.once('open', () => {
        console.log('[+] Connected to database successfully');
    });

    return mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/express_shop_api', {
        debug: process.env.DEBUG || true,
        keepAlive: true,
        useNewUrlParser: true,
    });
};

