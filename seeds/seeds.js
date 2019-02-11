const User = require('../models/user.model');
const Role = require('../models/role.model');
const Tag = require('../models/tag.model');
const Category = require('../models/category.model');
const Product = require('../models/product.model');
const Comment = require('../models/comment.model');
const Address = require('../models/address.model');
const Order = require('../models/order.model').Order;
const ORDER_STATUS = require('../models/order.model').ORDER_STATUS;
const OrderItem = require('../models/order_item.model');
const faker = require('faker');

const seedState = {
    flags: {
        seedAdmin: true,
        fullSeedStandardUsers: false,
        fullSeedComments: false,
        fullSeedproducts: false,
        fullSeedAddresses: false,
    },
    data: {
        users: [],
        comments: [],
        addresses: [],
        products: [],
        tags: [],
        categories: [],
        roles: []
    }
};

async function seedAdminFeature() {
    console.log('[+] Seeding Admin feature');

    await Promise.all([
        Role.findOneOrCreateWith({name: 'ROLE_ADMIN'}, {
            name: 'ROLE_ADMIN',
            description: 'For admin users'
        }),
        User.find({username: 'admin'})
    ]).then(async results => {
        const role = results[0];
        const user = results[1];
        seedState.data.roles.admin = role;
        // if admin user not created, then create it
        if (user.length === 0) {
            const user = new User({
                username: 'admin',
                password: 'password',
                email: 'admin@api_express_mongoose.com',
                firstName: 'adminFN',
                lastName: 'adminLN',
                roles: [role]
            });
            role.users.push(user);
            await Promise.all([user.save(), role.save()]).then(results => {
                const adminUser = results[0];
                seedState.data.users.push(adminUser);
                seedState.flags.seedAdmin = true;
            }).catch(err => {
                console.error(err);
                process.exit(-1);
            });
        }
    }).catch(err => {
        throw err;
    });
}

async function seedUsersFeature() {
    await Role.findOneOrCreateWith({name: 'ROLE_USER'}, {
        name: 'ROLE_USER',
        description: 'For authenticated users'
    }).then(async role => {

        const query = {
            // roles: {"$in": [role._id]} // also works
            roles: {$in: [role]}
        };

        await User.count(query).then(async usersCount => {

            seedState.data.roles.user = role;

            let usersToSeed = 25;
            usersToSeed -= usersCount;
            console.log(`[+] Seeding ${usersToSeed} users`);

            if (usersToSeed <= 0)
                return;

            for (let i = 0; i < usersToSeed; i++) {
                const user = new User({
                    username: faker.name.firstName() + faker.name.lastName(),
                    password: 'password',
                    email: faker.internet.email(),
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    roles: [role]
                });
                role.users.push(user);
                await Promise.all([user.save(), role.save()]).then(results => {
                    const user = results[0];
                    seedState.data.users.push(user);
                    if (i === (usersToSeed - 1)) {
                        if (usersToSeed === 25)
                            seedState.flags.fullSeedStandardUsers = true;
                    }
                }).catch(err => {
                    throw err;
                });
            }
        }).catch(err => {
            console.error("[-] Failed to create ROLE_USER");
            throw err;
        });
    }).catch(err => {

    });
}

function seedTags() {
    return Promise.all([
        Tag.findOneOrCreateWith({name: 'Shoes'}, {
            name: 'Shoes',
            description: 'Shoes in all colors'
        }),
        Tag.findOneOrCreateWith({name: 'Pants'}, {
            name: 'Pants',
            description: 'Pants for everyone'
        }),
        Tag.findOneOrCreateWith({name: 'Jackets'}, {
            name: 'Jackets',
            description: 'Jackets for everyone'
        })]).then(results => {
        seedState.data.tags = results;
    }).catch(err => console.error(err));
}


function seedCategories() {
    return Promise.all([
        Category.findOneOrCreateWith({name: 'Kids'}, {
            name: 'Kids',
            description: 'Kids clothes'
        }),
        Category.findOneOrCreateWith({name: 'Teenagers'}, {
            name: 'Teenagers',
            description: 'Teenager clothes'
        }),
        Category.findOneOrCreateWith({name: 'Men'}, {
            name: 'Men',
            description: 'Men clothes'
        }),
        Category.findOneOrCreateWith({name: 'Women'}, {
            name: 'Women',
            description: 'Women clothes'
        })]).then(results => {
        seedState.data.categories = results;
    }).catch(err => console.error(err));

}

async function seedProducts() {

    await Product.count().then(async count => {
        let productsToSeed = 17;
        productsToSeed -= count;

        if (productsToSeed <= 0)
            return;


        for (let i = 0; i < productsToSeed; i++) {
            let tag = seedState.data.tags[Math.floor(Math.random() * seedState.data.tags.length)];
            let category = seedState.data.categories[Math.floor(Math.random() * seedState.data.categories.length)];
            const product = new Product({
                name: faker.lorem.sentence(),
                description: faker.lorem.sentences(2),
                price: faker.random.number({min: 100, max: 10000}),
                tags: [tag],
                categories: [category],
                views: faker.random.number({min: 0, max: 10000}),
            });
            tag.products.push(product);
            category.products.push(product);

            await Promise.all([
                product.save(),
                tag.save(),
                category.save()]).then(results => {
                const product = results.shift();
                seedState.data.products.push(product);
                if (i === (productsToSeed - 1)) {
                    if (productsToSeed === 17)
                        seedState.flags.fullSeedProducts = true;
                }
            }).catch(err => {
                throw err;
            });
        }
    }).catch(err => {
        throw err;
    });
}

async function seedComments() {
    await Comment.count().then(async count => {

        let commentsToSeed = 10;
        commentsToSeed -= count;
        if (commentsToSeed <= 0) {
            console.log('[+] Skipping comments seeds, there are many already.');
            return;
        }

        console.log(`[+] Seeding ${commentsToSeed} comments`);
        await Promise.all([
            // if we have all products in memory(products array) then there is no need to load them, which we would do otherwise.
            seedState.flags.fullSeedProducts ? seedState.data.products : Product.find({}),
            seedState.flags.fullSeedStandardUsers && seedState.flags.seedAdmin ? seedState.data.users : User.find({})
        ]).then(async results => {
            const products = results[0];
            const users = results[1];

            for (let i = 0; i < commentsToSeed; i++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const user = users[Math.floor(Math.random() * users.length)];
                const comment = new Comment({
                    content: faker.lorem.sentence(),
                    rating: faker.random.number({min: 1, max: 5}),
                    user: user,
                    product: product
                });
                product.comments.push(comment);
                user.comments.push(comment);
                await Promise.all([
                    product.save(),
                    comment.save(),
                    user.save(),
                ]).then(async results => {
                }).catch(err => {
                    throw err;
                });
            }
        }).catch(err => {
        });

    }).catch(err => {
        throw err;
    });
}

async function seedAddresses() {

    await Promise.all([
        seedState.flags.seedAdmin && seedState.flags.fullSeedStandardUsers ? seedState.data.users : User.find({}),
        Address.count()])
        .then(async results => {
            const users = results[0];
            const count = results[1];
            let addressesToSeed = 40;
            addressesToSeed -= count;

            if (addressesToSeed <= 0) {
                console.log('[+] Skipping addresses seeds, there are many already.');
                return;
            }

            console.log(`[+] Seeding ${addressesToSeed} addresses`);

            for (let i = 0; i < addressesToSeed; i++) {
                const address = new Address({
                    zipCode: faker.address.zipCode(),
                    city: faker.address.city(),
                    country: faker.address.country(),
                    address: faker.address.streetAddress(),
                });

                const promises = [];

                if (faker.random.boolean()) {
                    address.user = users[Math.floor(Math.random() * users.length)];
                    // add this address to the other side of the relationship(user)
                    address.user.addresses.push(address);
                    promises.push(address.user.save());
                }

                promises.push(address.save());

                await Promise.all(promises).then(async results => {
                    const address = results.pop();
                    seedState.data.addresses.push(address);

                    if (i === (addressesToSeed - 1)) {
                        if (addressesToSeed === 20)
                            seedState.flags.fullSeedAddresses = true;
                    }
                }).catch(err => {
                    throw err;
                });
            }
        }).catch(err => {
            throw err;
        });
}

async function seedOrders() {

    await Promise.all([
        Order.count(),
        Address.find({}).populate('user')
    ]).then(async results => {
        let ordersToSeed = 20;

        const ordersCount = results[0];
        const addresses = results[1];

        ordersToSeed -= ordersCount;
        const promises = [];

        const usersWithPendingSave = [];
        const addressesWithPendingSave = [];

        const keys = Object.keys(ORDER_STATUS);
        let products = [];
        await Product.find({}).then(p => {
            products = p;
        });

        for (let i = 0; i < ordersToSeed; i++) {
            let randomOrderStatusKey = keys[Math.floor(Math.random() * keys.length)];
            let orderStatus = ORDER_STATUS[randomOrderStatusKey][0];

            // let user = seedState.data.users[Math.floor(Math.random() * seedState.data.users.length)];
            let address = addresses[Math.floor(Math.random() * addresses.length)];

            let order = new Order({
                trackingNumber: faker.random.alphaNumeric(20),
                orderStatus: orderStatus,
                user: address.user,
                address: address,
            });

            // TODO: I created usersWithPendingSave because if we call two times model.save() and we feed the returned promises into an async executor such as Promise.all
            // it throws an exception of type: can't save() the same doc multiple times in parallel. Document: 5c619da5f99ce54958c2bb53
            // I implemented this check for users and addresses because they may be reused over and over, so potentially we could call save() over and over again
            // leading to the error
            // update user's orders if order is not done by anonymous user
            if (order.user != null) {
                order.user.orders.push(order);
                if (!usersWithPendingSave.includes(order.user.id)) {
                    usersWithPendingSave.push(order.user.id);
                    promises.push(order.user.save());
                }
            }

            order.address.orders.push(order);

            if (!addressesWithPendingSave.includes(order.address.id)) {
                addressesWithPendingSave.push(order.address.id);
                promises.push(order.address.save());
            }

            let orderItemsToSeed = faker.random.number({min: 1, max: 5});

            for (let j = 0; j < orderItemsToSeed; j++) {
                let product = products[Math.floor(Math.random() * products.length)];
                let orderItem = new OrderItem({
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    quantity: faker.random.number({min: 1, max: 5}),
                    order: order,
                    user: order.user
                });

                order.orderItems.push(orderItem);
                promises.push(orderItem.save());
            }
            promises.push(order.save());
        }

        await Promise.all(promises).then(results => {
            console.log('Seeded orders');
        }).catch(err => {
            throw err;
        });
    }).catch(err => {
        throw err;
    });
}

exports.seed = async () => {
    await seedAdminFeature();
    await seedUsersFeature();
    await seedTags();
    await seedCategories();
    await seedProducts();
    await seedComments();
    await seedAddresses();
    await seedOrders();
    console.log('[+] Finished seeding');
    process.exit();
};