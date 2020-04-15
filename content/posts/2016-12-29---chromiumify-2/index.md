---
title: "chromiumify #2"
published: true
date: "2016-12-29"
slug: "/chromiumify-2"
author: "anton"
category: "tech"
tags:
  - programming
  - chromeapp
cover: "https://unsplash.it/1280/500/?random?BoldMage"
---

With the latest release of [chromiumify](https://github.com/chromiumify/chromiumify) you can now publish and install Chrome Apps from [NPM](https://www.npmjs.com/).

{<1>}![node](https://www.npmjs.com/static/images/npm-logo.svg)


In this tutorial we will create a basic Chrome App using chromiumify and publish it to npm.

### Let's Go!!
To start lets install chromiumify
```
$ npm install chromiumify -g
```
Create a project folder 
```
$ mkdir hello-world-proj
$ cd hello-world-proj
```

Now create a folder for the chrome app. This will contain the build output for your project.
```
$ mkdir chrome-app
```

Then use chromiumify to generate a template project in the folder that you just created.

```
$ chromiumify gen chrome-app
```

You should now be able to see the template project run
```
$ chromiumify run chrome-app
```

The above command should show this screen. 

{<2>}![Initial Screen](./images/EWcTOy9.png)


Now you have the base application up lets publish it to NPM

First we need to create a package.json so run 
```
$ npm init
```
And answer the prompts

Now you will need to create a folder to hold the post installation script and then run chromiumify to generate the configuration.

```
$ mkdir npminstall
$ chromiumify npmpkg npminstall chrome-app
```
The first parmeter (npminstall) is the folder the generated script will be placed into 
the second parameter (chrome-app) is the folder containing the chrome app. 

Now you can publish the app to NPM

```
$ npm publish
```
And users can install it directly into there local chrome browser with

```
$npm install name_of_your_app
```
