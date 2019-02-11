function initPage(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 5;

    req.page = page;
    req.pageSize = pageSize;

    next();
}

module.exports = {initPage};