---
title: "Post Mortem debugging for node.js on FreeBSD"
published: true
date: "2017-08-15"
slug: "/post-mortem-debugging-for-node-js-on-freebsd"
author: "anton"
category: "tech"
tags:
  - programming
  - olly
  - nodejs
  - freebsd
cover: "./images/post-mortem-freebsd.png"
---

### Motivation 
A few months ago I was talking to [nomadlogicLA](https://twitter.com/nomadlogicLA) on twitter about managing node.js processes on FreeBSD.

The obstacle that nomadlogic was trying to get around was how to handle a node.js process that kept stopping due to memory issues.
![](images/2017/08/Motivation.png)

The problem was overcome by restarting the process. 

While this got over the immediate issue there was obviously and underlying problem and from experience I know these things will come back to bite you on a cold dark evening.

Now I'm probably overly invested in this simple twitter exchange but I started to get concerned. 

**What would happen to nomad's system under heavy load?**

**What if it was an edge case that could become more prevalent if the users started using the app in a slightly different way?**
 
So I tried to prompt nomad to doing some root cause of the memory issue by using the [heapdump tools](https://strongloop.com/strongblog/how-to-heap-snapshots/) from strongloop.

> Unsurprisingly the discussion went cold.

The heapdump approach has some nits. It needs an additional component and code changes in the application. This is typical as library based approaches are invasive and updating at the application level can require cross team coordination that is sometimes difficult due to organizational boundaries. 

In the past I have navigated around these type of constraints by running the node.js process with the `--abort-on-uncaught-exception` flag and [analyzing the output](https://www.joyent.com/blog/mdb-and-node-js) on [open indiana](https://www.openindiana.org/) with mdb.

This works if you are running the node application on a Linux or illumOS system but mdb doesn't currently support FreeBSD cores although [some work has been started on it](https://github.com/ahrens/illumos/commit/018e181a674cb836d62b1dcee9833c15068d7444) by Matt Ahrens.

I had heard that [Fedor Indutny](https://vimeo.com/172629474) had put some work into getting core dumps of node.js working with lldb so I went to find how servicable that would be for FreeBSD.

It turned out that after a couple of tweaks to the build process and a [few patches submitted](https://github.com/nodejs/llnode/pull/96/commits) to llnode - post mortem debugging of node.js processes on FreeBSD is now very easy to do. 

> post mortem debugging of node.js processes on FreeBSD is very easy

The rest of this article will provide a step by step guide for setting up a clean FreeBSD and running a sample scenario to show what is achievable.

### Setup

This was tested on a FreeBSD 11.1 on [Digital Ocean](https://cloud.digitalocean.com/droplets/new?i=eedd1f&size=2gb&region=nyc3&distro=freebsd&distroImage=freebsd-11-1-x64-zfs) so we will step through all the steps for configuring a vanilla image.


```
# sudo pkg install node npm llvm39
```
### Configure lldb
We are going to use 3.9 as other versions of lldb [seem to have an issues](https://github.com/nodejs/llnode/issues/93) with some of the commands

```
# sudo rm -f /usr/bin/lldb
# sudo ln -s /usr/local/llvm39/bin/lldb /usr/bin/lldb
```
### Install llnode
```
# sudo npm install llnode -g --unsafe-perm
```
This will give us an `llnode` command that we can load from the commandline prompt and you should be dropped into an lldb session with the `v8` plugin preloaded.

### Verify the install

```
% llnode 
(llnode)
(llnode) v8
v8
     Node.js helpers
     ...
(llnode) exit
```

### Example Usage
Now we have a working environment I am going to give a sample demo using the introduction from this [great tutorial by Howard Hellyer](https://developer.ibm.com/node/2016/08/15/exploring-node-js-core-dumps-using-the-llnode-plugin-for-lldb/) It's simple helloworld but I've updated to use llnode command prompt rather than the underlying lldb as mentioned in that article.

**1. Create a broken server that calls itself**
```
var http = require('http');
var host = '127.0.0.1';
var port = 1338;

server = http.createServer(function myRequestListener(req, res) {
     res.writeHead(200, {'Content-Type': 'text/plain'});
     res.end('Hello World\n');
     res.not_a_function();
}).listen(port, host, function() {
     http.get(`http://${host}:${port}/`, function(res){});
});
console.log(`Server process ${process.pid} running at http://${host}:${port}/`);
```

**2. Run the server**

```
% node --abort-on-uncaught-exception httpexception.js
```
This should fail instantly and a core dump called node.core created in the same folder.

**3. Load the core file into llnode**
```
% llnode node -c node.core 
```
where node is the executable to load along side the core dump

**4. Print the objects in memory at the time of the crash**
```
(llnode) v8 findjsobjects
Instances  Total Size Name
 ---------- ---------- ----
          1         24 Control
          1         24 FastBuffer
          1         24 JSON
          1         24 Math
          1         24 RangeError
          1         24 TypeError
          1         32 Arguments
          1         32 TCPConnectWrap

```

### Summary

You should now be able to see how easy it is to load a core dump of a dying process and to understand what is causing it to fail. 

You might want to go back over [Howard's article](https://developer.ibm.com/node/2016/08/15/exploring-node-js-core-dumps-using-the-llnode-plugin-for-lldb/) to get more info on traversing the back traces.

If you having memory type issues like the one mentioned at the start of the article then Brendon Gregg has [a great article](http://www.brendangregg.com/blog/2016-07-13/llnode-nodejs-memory-leak-analysis.html) on how to use llnode to dive into resolving those issues.

Until next time ... happy debugging



