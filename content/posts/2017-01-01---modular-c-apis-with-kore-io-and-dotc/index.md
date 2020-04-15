---
title: "Modular C APIs with kore.io and dotc"
published: true
date: "2017-01-01"
slug: "/modular-c-apis-with-kore-io-and-dotc"
author: "anton"
category: "tech"
tags:
  - programming
cover: "images/include.png"
---

## Background
Most high performance network applications today are using event based approaches. See [nginx](http://nginx.org/en/docs/events.html) or [libuv for node.js](http://docs.libuv.org/en/v1.x/design.html) for some in depth detail.

So when I stumbled across [kore.io](https://kore.io/) on the [irish tech community slack](http://irishtechcommunity.com/) channel and noticed it also [used system events](https://www.gitbook.com/book/jorisvink/kore-doc/details) I was intrigued and marked it for a closer look when I had time.
As I had a few hours spare recently I thought I would dive in and write up whatever I found. 

[kore.io](https://kore.io/) is a library with support tools that provides HTTP/S, Websocket and task modules in c along with integration to postgresql.
> kore.io feels like express for c

Possibly more significant is the 'composition' based approach. This design pattern is very accessible and gives kore.io the feel of 'express for c'.

While the composability felt correct the lack of a defined module system looked like an opportunity for improvement. Then I remembered a project I contributed to about 3 years ago - [dotc by James Haliday](https://github.com/substack/dotc). 

> use node-style #require and #export directives in c! 

dotc is 'a c/c++ preprocessor that copies the semantics of node.js's module lookup algorithm without modifying anything else about the c language'

So I looked into what would be involved to in using these two technologies together and the rest of this article is a sample helloworld to illustrate how this can be done.

## Prerequisites
I used FreeBSD for this tutorial but any recent *nix system should be OK but not Windows yet. You will also need [gcc](https://gcc.gnu.org/) and [node.js](https://nodejs.org/) installed.

## [Install ](#install)
kore.io is simple to install. As per the instructions on the [github page](https://github.com/jorisvink/kore) clone the repo and build and make
```
% git clone https://github.com/jorisvink/kore.git
% cd kore
% make
# make install
```
As dotc is a node application it's a simple npm install.
```
% npm install -g dotc
```

## The Project
* You can follow the steps below but the finished app is also [available here](https://github.com/No9/helloworld).

* First create a kore project and change directory to the project root
```
% kore create helloworld
% cd helloworld
```

* dotc uses a preprocessor to parse the files and generate output. To facilitate this we are going to create a pre-process folder called **pre** to work in.
```
% mkdir pre
```
* Now we need a base file to work from so we will move the stub in `src` to `pre`
```
% mv src/helloworld.c pre/helloworld.c
```

* With everything in place we are ready to build a module. Create a new file in pre called hello.c and add the following code. This will create our body and our response length and will export our function as a single call.

```
#include <string.h>

#export= hello 
void hello (char** body, int *body_len) {
   char * msg = "hello world";
   *body = msg;
   *body_len = strlen(msg);
}
```

* Now we need to edit `pre/helloworld.c` so it looks like the following comments are included in the code for explanation. 
```
#include <kore/kore.h>
#include <kore/http.h>

// This exposes the function hello as h()
#require "./hello.c" as h

// As we are going to compile this as a C++ project we need to make the page interface available. 
extern "C" {
   int page(struct http_request *);
}

int page(struct http_request *);

int
page(struct http_request *req)
{
   // Set up the variables that hello() will set
   int len;
   char * body;
   //call our aliased hello function
   h(&body, &len); 
   //set the response.
   http_response(req, 200, body, 11);
   return (KORE_RESULT_OK);
}
```

* Now we have the files in place we need to precompile them using dotc. Notice we give the output a `.cpp` extension so it will compile it as a C++ project.
```
dotc pre ./pre/helloworld.c > ./src/helloworld.cpp
```

* To finish we simply run kore which will build and run the code.
```
% kore run
```
* The service should now be available from [https://127.0.0.1:8888](https://127.0.0.1:8888). As it uses self signed certs you will have to accept the security exception before you can browse to it. But you can also `curl` it with the `-k` flag
```
curl -k https://127.0.0.1:8888/
``` 

## Summary

I hope you found this little sample interesting and can see the possibilities of writing a modular C API server.
kore.io has a lot of potential and writing this tutorial has also introduced me to other features such as the embedding assets that I will write more about when I get some time.

## Attribution 
Thanks to [James Halliday](https://github.com/substack) not only for dotc but the banner at the top of this article and an just as much thanks to [Joris Vink](https://github.com/jorisvink) for kore.io. I've enjoyed tinkering around 
  
