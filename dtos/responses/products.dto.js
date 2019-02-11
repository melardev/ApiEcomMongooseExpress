const PageMetaDto = require("./page_meta.dto");
const TagDto = require("./tags.dto");
const CategoryDto = require("./categories.dto");
const UserDto = require("./users.dto");
const CommentsDto = require("./comments.dto");

function buildPagedList(products, commentsCountArray, page, pageSize, totalProductsCount, basePath) {
    return {
        success: true,
        page_meta: PageMetaDto.build(page, pageSize, totalProductsCount, basePath),
        ...buildDtos(products, commentsCountArray),
        // products: products.map(product => buildSummary(product))
    }
}

function buildDtos(products, commentsArray) {
    return {
        products: products.map((product, index) => buildDto(product, commentsArray[index]))
    };
}

function buildDto(product, commentsCount) {
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        image_urls: product.images ? product.images.map(image => image.filePath) : [],
        created_at: product.createdAt,
        updated_at: product.updatedAt,
        ...TagDto.buildDtos(product.tags),
        ...CategoryDto.buildDtos(product.categories),
        comments_count: commentsCount ? commentsCount.comments : product.comments ? product.comments.length : 0,
    };
}

function buildDetails(product, includeCommentUser, includeCommentProductSummary) {
    let product_result = buildDto(product);
    product_result.comments_count = undefined; // remove comments_count, we are going to display all comments anyway
    product_result.description = product.description;
    product_result.likes_count = product.likes_count;
    product_result = {...product_result, ...CommentsDto.buildDtos(product.comments, includeCommentUser, includeCommentProductSummary)};

    return {
        success: true,
        ...product_result
    };

}

function buildOnlyForIdAndSlug(product) {
    return {success: true, slug: product.slug, id: product.id};
}

function buildIdSlugNameAndPrice(product) {
    if (product == null)
        return {};
    return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: parseInt(product.price)
    };
}

module.exports = {
    buildPagedList, buildDtos, buildDetails, buildDto, buildOnlyForIdAndSlug, buildIdSlugNameAndPrice
};