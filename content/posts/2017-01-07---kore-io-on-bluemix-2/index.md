---
title: "Introducing the kore.io Cloud Foundry build pack"
published: true
date: "2017-01-07"
slug: "/kore-io-on-bluemix-2"
author: "anton"
category: "tech"
tags:
  - programming
  - koreio
  - c
cover: "images/koreio-bluemix.jpg"
---

Following on from the previous post on [modular C APIs for kore.io](http://venshare.com/modular-c-apis-with-kore-io-and-dotc/) This post looks at using a [Cloud Foundry](https://en.wikipedia.org/wiki/Cloud_Foundry)<sup>1</sup> approach to speed up the deployment of a [kore.io](https://www.kore.io) service.
The result will be a simple http server that sends an empty 200 HTTP response but it should illustrate the point of how easy it is to build and deploy a HTTP server in C.

## Prerequisites 
You will need [kore.io](https://www.kore.io) installed on your machine and this article assumes you have access to a cloud foundry provider and your have the `cf` command line client installed.

If kore isn't installed then you can follow the [instructions in the previous article](http://venshare.com/modular-c-apis-with-kore-io-and-dotc/#install).
For a cloud foundry service you can set up a free account on [Bluemix](https://console.ng.bluemix.net/registration/?target=%2Fdashboard%2Fapps) (no credit card required) and a download for the [**cf** client here](https://github.com/cloudfoundry/cli/releases). Any additional pointers you need for setting up the **cf** application are [available here](https://github.com/cloudfoundry/cli#downloads).

Once you have those three pieces this exercise should only take 5 minutes to do as there is zero code. 

## Steps
**1. Set up a project folder**
At the command prompt create a folder called hello-kore and change into it. All the commands in this how to will assume your are working from the hello-kore folder
```
$ mkdir hello-kore
$ cd hello-kore
```
**2. Create a kore application**
```
$ kore create worldapp
```
This creates a simple kore application in a folder called worldapp

**3. Update the network settings**

In your favourite editor open `worldapp/conf/worldapp.conf` and change the IP address from `127.0.0.1` to `0.0.0.0` to bind the app to all the network interfaces.

**4. Update the build file for a single binary deployment** 

Open `worldapp/conf/worldapp.conf` and change it to look like this. 
```
single_binary=yes
kore_source=../../kore
kore_flavor=NOTLS=1

# The flags below are shared between flavors
cflags=-Wall -Wmissing-declarations -Wshadow
cflags=-Wstrict-prototypes -Wmissing-prototypes
cflags=-Wpointer-arith -Wcast-qual -Wsign-compare
cxxflags=-Wall -Wmissing-declarations -Wshadow
cxxflags=-Wpointer-arith -Wcast-qual -Wsign-compare

ldflags=-lcrypto

dev {
}
```
We are basically enabling a production single binary build with a reference to the kore supplied in the buildpack with no transport level security `NOTLS` as that is provided the CF runtime.
Due to some edge dependencies we have to supply `ldflags=-lcrypto` flag to the compilier.

**5. Finally publish to cloud foundry with the following command**
```
$ cf push worldapp -b https://github.com/no9/kore-buildpack.git -c "./worldapp/worldapp -rn"
```
You should have an OK response at the end. Confirm the route to the host has been created with

**6. Check the deployment**
```
$ cf routes
space   host     domain        apps
dev     worldapp mybluemix.net worldapp
....
```
With the route you can then test the end point with
```
$ curl -v https://URL_TO_ROUTE
```
In my case it was
```
curl -v https://worldapp.mybluemix.net/
```
And it gave the output
```
........
< HTTP/1.1 200 OK
< X-Backside-Transport: OK OK
< Connection: Keep-Alive
< Transfer-Encoding: chunked
< Server: kore (2.1.0-devel)
< Strict-Transport-Security: max-age=31536000; includeSubDomains
< Date: Sat, 07 Jan 2017 01:23:40 GMT
< X-Global-Transaction-ID: 3516363111
```

Thats all for now next time we will look at creating a JSON request and response and exposing that on API Connect. 

## References
This is a good hands on introduction to the internals of a cloud foundry application. [Building your own Buildpack (i.e. for C) - Fco.Ramos](https://www.ibm.com/developerworks/community/wikis/home?lang=en#!/wiki/We0d917403ade_46b2_8991_d1eabb8126f6/page/Building%20your%20own%20Buildpack%20%28i.e.%20for%20C%29)
The buildpack I developed to support this deployment is available here https://github.com/No9/kore-buildpack
