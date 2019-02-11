require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');
const AppResponseDto = require("./dtos/responses/app_response.dto");
const BenchmarkMiddleware = require('./middlewares/benchmark.middleware');
const AuthMiddleware = require('./middlewares/auth.middleware');
const app = express();
app.use(BenchmarkMiddleware.benchmark);

require('./config/mongodb.config').configure().then(res => {
    require('./config/passport.config')(passport);

    const productsRouter = require('./routes/products.routes');
    const commentsRouter = require('./routes/comments.routes');
    const ordersRouter = require('./routes/orders.routes');
    const addressesRouter = require('./routes/addresses.routes');
    const tagCategoriesRouter = require('./routes/tags_categories.routes');
    const usersRouter = require('./routes/users.routes');
    const pagesRouter = require('./routes/pages.routes');

    app.use(cors());
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({extended: false}));
    app.use(express.static(path.join(__dirname, 'public')));


    app.use(AuthMiddleware.loadUser);
    app.use('/api', pagesRouter);
    app.use('/api', usersRouter);
    app.use('/api/products', productsRouter);
    app.use('/api', commentsRouter);
    app.use('/api/orders', ordersRouter);
    app.use('/api', addressesRouter);
    app.use('/api', tagCategoriesRouter);

// catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.json(AppResponseDto.buildWithErrorMessages('Something went wrong 5xx ' + err));
    });


}).catch(err => {
    throw err;
});
module.exports = app;
