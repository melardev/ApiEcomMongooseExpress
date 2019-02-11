require('dotenv').config();
require('./../config/mongodb.config').configure().then(res => {
    require('./seeds').seed();
}).catch(err => {
    // throw err;
    console.error(err);
    process.exit(-1);
});