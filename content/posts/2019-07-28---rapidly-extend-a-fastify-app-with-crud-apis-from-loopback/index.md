---
title: "Rapidly extend a Fastify app with automated API generation from LoopBack"
published: true
date: "2019-07-28"
slug: "rapidly-extend-a-fastify-app-with-crud-apis-from-loopback"
author: "anton"
category: "tech"
tags:
  - programming
  - nodejs
  - fastify
  - loopback
cover: "./images/cover.png"
---

### Introduction
[Go straight to the code](https://github.com/No9/fastify-loopback-example)

Today I was working on a project that required extending with 5 new REST endpoints. Each complete with a Create, Read, Update and Delete (CRUD) implementation.

The project was already using a [standard middleware](https://expressjs.com/en/guide/using-middleware.html) approach with callback based javascript so I decided to see how [Loopback 4](https://loopback.io/) could help in this scenario.

I was so quick completing the work that I thought I would share what I did with a [Fastify](https://www.fastify.io/) example but any middleware compliant node.js web framework should be very similar.

For those not familiar with [Fastify](https://www.fastify.io/) it's a fast, low overhead web framework focusing on high resource utilisation with a strong focus on developer experience.

[Loopback 4](https://loopback.io/) is a complete API development system and can host APIs as a standalone project but it is very extensible and easy to integrate with your favourite node.js web framework. Loopback 4 also provides a lot of automation to take the chores out API development as well as providing a solid footing for best practices such as generated API definitions.
![](/content/images/2019/07/API-Utility.png)


The following is a set of steps to explain how I got there but if you want to jump to the finished service just jump here [fastify-loopback-example](https://github.com/No9/fastify-loopback-example)

It's based on the [original article](https://loopback.io/doc/en/lb4/express-with-lb4-rest-tutorial.html#add-a-datasource) from the loopback team that focuses on a TypeScript Express example.

### Prerequisites
Assuming you have node.js installed you simply need the loopback client.
Install the loopback command line and we are ready to go.
`$ npm i -g @loopback/cli`

### Fastify Project

Let's make a directory and change into it.
```
$ mkdir fastify-loopback-example
$ cd fastify-loopback-example
```
We will initialize the project so we can install packages. We can just accept the defaults but feel free to change them if you want.
```
$ npm init 
```
Once that's complete we can install Fastify.
```
$ npm install fastify -S
```
Now let's create a file called index.js - This represents our web app that we are extending.

```
const fastify = require('fastify')({ logger: true })

// Declare a route
fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' })
})

// Run the server!
fastify.listen(3000, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${fastify.server.address().port}`)
})
```
Now you can check everything is working
```
$ node index.js
{"level":30,"time":1564344999675,"pid":15556,"hostname":"LAPTOP-0AGG9V30","msg":"Server listening at http://127.0.0.1:3000","v":1}
{"level":30,"time":1564344999677,"pid":15556,"hostname":"LAPTOP-0AGG9V30","msg":"server listening on 3000","v":1}
```

### Extending with Loopback

Still in the project folder create a new loopback service.
```
$ lb4 app services
? Project description: An application for recording notes.
? Project root directory: (services)
? Application class name: (ServicesApplication)
 ◉ Enable eslint: add a linter with pre-configured lint rules
 ◉ Enable prettier: install prettier to format code conforming to rules
 ◉ Enable mocha: install mocha to run tests
 ◉ Enable loopbackBuild: use @loopback/build helpers (e.g. lb-eslint)
 ◉ Enable vscode: add VSCode config files
❯◯ Enable docker: include Dockerfile and .dockerignore
 ◉ Enable repositories: include repository imports and RepositoryMixin
 ◉ Enable services: include service-proxy imports and ServiceMixin
 # npm will install dependencies now
 Application service was created in service.
```
Now change into the services folder
```
$ cd services
```
### Create a Model
Now we are going to create a model that will automatically generate our CRUD endpoints by running `lb4 model` and creating `id`, `title` and `content` properties.
```
$ lb4 model
? Model class name: Note
? Please select the model base class Entity (A persisted model with an ID)
? Allow additional (free-form) properties? No
Model Note will be created in src/models/note.model.ts

Let's add a property to Note
Enter an empty property name when done

? Enter the property name: id
? Property type: number
? Is id the ID property? Yes
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to Note
Enter an empty property name when done

? Enter the property name: title
? Property type: string
? Is it required?: Yes
? Default value [leave blank for none]:

Let's add another property to Note
Enter an empty property name when done

? Enter the property name: content
? Property type: string
? Is it required?: No
? Default value [leave blank for none]:

Let's add another property to Note
Enter an empty property name when done
```
### Create A Datastore

This example uses a flat file as a database but storage is abstracted in loopback and support for most of the common databases is supported.
See the [list of connectors](https://loopback.io/doc/en/lb2/Database-connectors.html) for more details.
Still in the services folder create a data directory 
and run the `lb4 datasource ds` command.

Select In-memory db and skip the browser config by pressing return and enter `./services/data/data.json` for the server config.
```
$ mkdir data
$ touch data/ds.json
$ lb4 datasource ds
? Select the connector for ds:
> In-memory db (supported by StrongLoop)
  In-memory key-value connector (supported by StrongLoop)
  IBM Object Storage (supported by StrongLoop)
  IBM DB2 (supported by StrongLoop)
  IBM DashDB (supported by StrongLoop)
  IBM MQ Light (supported by StrongLoop)
  IBM Cloudant DB (supported by StrongLoop)
(Move up and down to reveal more choices)
```
Now add the following sample data to the file.
```
{
  "ids": {
    "Note": 3
  },
  "models": {
    "Note": {
      "1": "{\"title\":\"Things I need to buy\",\"content\":\"milk, cereal, and waffles\",\"id\":1}",
      "2": "{\"title\":\"Great frameworks\",\"content\":\"LoopBack is a great framework\",\"id\":2}"
    }
  }
}
```

### Create a Repository
A Repository represents a specialized Service interface that provides strong-typed data access (for example, CRUD) operations of a domain model against the underlying database or service.
To create the repository, run the `lb4 repository` command and choose the `DsDataSource`, as the datasource, `Note` model as the model, and `DefaultCrudRepository` as the repository base class.
```
$ lb4 repository
? Please select the datasource DsDatasource
? Select the model(s) you want to generate a repository Note
? Please select the repository base class DefaultCrudRepository (Legacy juggler bridge)
   create src\repositories\note.repository.ts
   update src\repositories\index.ts

Repository NoteRepository was created in src\repositories/
```
### Create a Note Controller
A Controller is a class that implements operations defined by an application’s API. It implements an application’s business logic and acts as a bridge between the HTTP/REST API and domain/database models.

We create one for this project using the `lb4 controller note` command, with the `REST Controller with CRUD functions` type, `Note model`, and `NoteRepository repository`. The id’s type will be number and base HTTP path name is the default /notes

```
$ lb4 controller note
Controller Note will be created in src/controllers/note.controller.ts

? What kind of controller would you like to generate? REST Controller with CRUD functions
? What is the name of the model to use with this CRUD repository? Note
? What is the name of your CRUD repository? NoteRepository
? What is the name of ID property? id
? What is the type of your ID? number
? What is the base HTTP path name of the CRUD operations? /notes
   create src\controllers\note.controller.ts
   update src\controllers\index.ts

Controller Note was created in src\controllers/
```
### Build the project
Now we can build our project with our models
```
$ npm run clean
$ npm run build
```
This will create a `dist` folder that we will reference from our main application.

### Update the Application
Now we can add it to the fastify application.
First require it into `index.js`
```
const ServicesApplication = require('./services/dist/application').ServicesApplication
```
Then we create a new instance of the application with an empty config.
```
var lbApp = new ServicesApplication({});
```
As we are running the service from a folder that is above the service folder we need to tell the app where the models are.
```
lbApp.projectRoot = __dirname + '/services/dist'
```

Next we need to boot the app before we start the server and attach the route so we wrap our current code with a promise.

```
lbApp.boot().then(function() {
    // Declare a route
    fastify.use('/api', lbApp.requestHandler)

    fastify.get('/', (request, reply) => {
    reply.send({ hello: 'world' })
    })

    // Run the server!
    fastify.listen(3000, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    })
})
```
### A Final Tweak
Unfortunately there is a dependency between the API explorer and the underlying web framework where the explorer expects the request object to have a `baseUrl` property. 
There is [work on going to resolve this](https://github.com/strongloop/loopback-next/pull/3133) but for now we have to augment the request to explorer with this property so we add a middleware component to deal with this.
```
    fastify.use('/api/explorer', function(req, res, next) {
        req.baseUrl = '/api'
        next();
    })
```
So the completed `index.js` for the project looks like this:
```
const fastify = require('fastify')({ logger: true })

const ServicesApplication = require('./services/dist/application').ServicesApplication
var lbApp = new ServicesApplication({});
lbApp.projectRoot = __dirname + '/services/dist'

lbApp.boot().then(function() {
    fastify.use('/api/explorer', function(req, res, next) {
        req.baseUrl = '/api'
        next();
    })
    // Attach the APIs and explorer
    fastify.use('/api', lbApp.requestHandler)
    // Declare a route
    fastify.get('/', (request, reply) => {
        reply.send({ hello: 'world' })
    })

    // Run the server!
    fastify.listen(3000, (err) => {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
    })
})

```

Now we can start our index service again 
```
$ node index.js
```
The explorer will be available at 
http://localhost:3000/api/explorer/
And the Notes should be available at the endpoint
http://localhost:3000/api/notes 
![Final Output](/content/images/2019/07/note-json.png)

If you have made it this far thanks a lot for following and please ask any questions to [@dhigit9 on twitter](https://twitter.com/dhigit9).
Also a big thanks to [Miroslav](https://twitter.com/bajtos) for helping with the "Tweak"

