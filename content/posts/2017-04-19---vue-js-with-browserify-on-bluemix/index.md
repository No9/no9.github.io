---
title: "Some notes on vue.js with browserify on bluemix"
published: true
date: "2017-04-19"
slug: "/vue-js-with-browserify-on-bluemix"
author: "anton"
category: "tech"
tags:
  - programming
  - nodejs
  - vuejs
cover: "images/browserify-vue.png"
---

Most of my days are spent up to my knees thinking about APIs. But this week I was asked to build a person finder app for work.

I thought this would be a great opportunity to take [vue.js](https://vuejs.org/) for a spin and see if I could get it up and running in a dev flow I am comfortable with.

What follows is really just notes I took on the way. I hope you find them useful.

My preferred bundling tool is [browserify](http://browserify.org/) because it makes frontend work feel as much like node.js development as possible. So I looked around I noticed that there is a [prebuilt browserify template](https://github.com/vuejs-templates/browserify) for the [vue.js command line interface](https://github.com/vuejs/vue-cli)
When I looked into the template I liked the way it was structured but the dependency on babel was too much for me. I am a little old school and if I was going to go for a language transpiler I would bite the whole bullet and use typescript.

So I decided to turn down the magic dial and use the vuejs template but without the babelification of all the things.
> Turn down the magic dial

So what follows is a step by step guide to setting up vue.js with browserify on Bluemix although it should be useful for anyone interested in browserify and vue.js in general.

The source code for this tutorial is available [here](https://github.com/No9/vuejs-browserify-bluemix.git) and you can deploy the project into your bluemix account by clicking this button.

[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/No9/vuejs-browserify-bluemix)

 

#### Lets install the toolchain
What follows is the toolchain you will need and what each tool does.

* browserify - Lets you use node modules in the browser and take a require approach to development.

```
$ npm install browserify -s
```

* vueify - Transform view components into a single browserify file
```
npm install vueify --save-dev
```

#### Setup Runtime Environment

First thing we are going to do is create a node.js application on bluemix. Simply [visit this link and click create](https://console.ng.bluemix.net/catalog/starters/sdk-for-nodejs?taxonomyNavigation=apps)

Once this is complete got to the overview section and enable continuous delivery. This will create a github repository for you and will automatically deploy when you push to master.
![Enable Continuous Delivery](images/2017/04/enable-deploy-tools.png)

Now we need to clone the github repo that you have just created as part of the enabling continuous integration. 

Once we have the project cloned we need to enable it for vuejs development. 

At the command prompt `cd` into the root of the cloned folder and install vue.
```
$ npm install vue -S
```
Now we need to install vueify as a developer dependency. This module that integrates vuejs with browserify.
```
$ npm install vueify -D
```
Install the node.js dependencies 
```
$ npm install
```

Create a folder called `src` and put in a simple `main.js`
```
// src/main.js
var Vue = require('vue')
var App = require('./app.vue')

new Vue({
  el: '#app',
  render: function (createElement) {
    return createElement(App)
  }
})
```
Now we update the public/index.html file in the public folder to use Vue
```
<!DOCTYPE html>
<!-- index.html -->
<html>

  <head>
    <title>Line Manager Meetup</title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="stylesheets/style.css">
    <script src="https://unpkg.com/vue"></script>
  </head>

  <body>
  <div id="app"></div>
      <script src="js/build.js"></script>
  </body>
  <script>

  </script>
</html>
```
Create a view the file src/app.vue

```
<style>
  .red {
    color: #f00;
  }
</style>

<template>
  <h1 class="red">{{msg}}</h1>
</template>

<script>
module.exports = {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>
```

Now that we have the files in place we need to compile them 

Update package.json for a dev build 
```
...
  "scripts": {
    "start": "node app.js",
	"dev" : "browserify -t vueify -e src/main.js -o public/js/build.js"
  },
...

```
Create a folder in `public/js` this is where the output will go
```
$ npm run dev
```
If this gives you a successful build you should be able to run the local server. 

```
$ node app
```
And browsing to the localhost address in the console output should give. 

![vue output](images/2017/04/vueout.png)

In the next post I will setup the watchify piece for automatic page refreshes during development and what needs to be done to put the package in production. 