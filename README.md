# Introduction
This is one of my E-commerce API app implementations. It is written in Node js, using Express and Mongoose as the main dependencies.
This is not a finished project by any means, but it has a valid enough shape to be git cloned and studied if you are interested in this topic.
If you are interested in this project take a look at my other server API implementations I have made with:

- [Node Js + Sequelize](https://github.com/melardev/ApiEcomSequelizeExpress)
- [Node Js + Bookshelf](https://github.com/melardev/ApiEcomBookshelfExpress)
- Django , I will release it in the next days
- Flask I will release it in the next days
- [Java Spring Boot + Hibernate]() for the most part this is the implementation of reference.
- Golang go-gonic I will release it in the next days
- Ruby on Rails I will release it in the next days
- AspNet Core I will release it in the next days
- AspNet MVC I will release it in the next days
- Laravel I will release it in the next days

## WARNING
I have mass of projects to deal with so I make some copy/paste around, if something I say is missing or is wrong, then I apologize
and you may let me know opening an issue.

# Getting started
As with most node js projects, do the following
1. git clone the project
2. Rename the .env.example to .env and change the settings according to what you need, configure the mongodb url there
3. npm install
4. npm start
5. The last step is up to you, you can either open it in an IDE and debug it, or you can open the api.postman_collection.json with Postman, and then execute the queries

# Features
- Authentication / Authorization
- Paging
- CRUD operations on products, comments, tags, categories
![Fetching products page](./github_images/postman.png)
- Orders, guest users may place an order
![Database diagram](./github_images/db_structure.png)

# What you will learn
- Mongoose ORM
    - associations: ref, ref[]
    - virtual attributes
    - complex queries
- express
    - middlewares
    - authentication
    - authorization
    
- seed data with faker js

- misc
    - project structure
    - dotenv


# Understanding the project
The project is meant to be educational, to learn something beyond the hello world thing we find in a lot, lot of 
tutorials and blog posts. Since its main goal is educational, I try to make as much use as features of APIs, in other
words, I used different code to do the same thing over and over, there is some repeated code but I tried to be as unique
as possible so you can learn different ways of achieving the same goal.

In most MongoDB applications the treatment of databases is completely different than Relation databases, in this app I 
did not follow that tendency, I treated MongoDB like it was a relation database, this is why I set bidirectional associations, for example:
usually people will store under roles collection an array of usernames that belong to that user, or another approach would be
to create an array of Ref to User collection in each of the roles document, in other words they will be applying association in only one side,
in my app I set up associations in both sides:
each role has an array of references to User ids that belong to that role, at the same time, each user has an array of references to Role ids
he belongs to. It may not be recommended in real world applications, but hey ... this is how I like it to be, sorry if you are disapointed.

Project structure:
- models: Mvc, it is our domain data.
- dtos: it contains our serializers, they will create the response to be sent as json. They also take care of validating the input(feature incomplete)
- controllers: well this is the mvC, our business logic.
- routes: they register routes to router middleware
- middleware: some useful middleware, mainly the authentication and authorization middleware.
- config: the database configurer as well as passport authentication strategies configurer.
- seeds: contains the file that seeds the database.
- .env the env file from where to populate the process.env node js environment variable
- public: contains the uploaded files.

# Steps followed to create build this project (incomplete)

- Generate the project with express-generator, so first install it globally
`$ npm install express-generator -g`
- then create the project with
`express myapp`
- install dependencies
`npm install`
- then write the code as I did -)

# TODO
- There are some input directly used when making mongodb queries, check if that leads to NoSQL injection
- Sanitization
- Better organization of dto files
- Bidirectional associations: when setting address's user field, set the user's addresses array
It is a little bit weird to handle the bidirectional, and in most applications I read they do not do that, but I prefer to.