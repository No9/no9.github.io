---
title: "DTrace flamegraphs for FreeBSD and node.js"
published: true
date: "2016-12-29"
slug: "/dtrace-flamegraphs-for-freebsd-and-node-js"
author: "anton"
category: "tech"
tags:
  - programming
  - freebsd
  - nodejs
  - olly
cover: "images/dtrace-freebsd-cover.png"
---

###### Introduction

Recently BSD UNIXes are being acknowledged by the application development community as an interesting operating system to deploy to. 

This is not surprising given that FreeBSD had [jails](https://en.wikipedia.org/wiki/FreeBSD_version_history#FreeBSD_4), the original container system, about 17 years ago and a lot of network focused businesses such as [netflix](http://www.phoronix.com/scan.php?page=news_item&px=MTExNDM) see it as the best way to deliver content. 

This developer interest has led to hosting providers supporting FreeBSD.
e.g. Amazon, Azure, Joyent and you can get a 2 months free instance at [Digital Ocean](https://m.do.co/c/8a4d6a80663a). 

[DTrace](http://dtrace.org/blogs/about/) is another vital feature for anyone who has had to deal with production issues and has been in FreeBSD since version 9. As of FreeBSD 11 the operating system now contains [some great work by Fedor Indutny](https://github.com/indutny/blog/blob/master/posts/7.freebsd-dtrace.md) so you can profile node applications and create [flamegraphs](https://nodejs.org/en/blog/uncategorized/profiling-node-js/) of node.js processes without any additional runtime flags or restarting of processes.
![](https://www.cs.brown.edu/~dap/helloworld.svg)
To understand this graphic further the 'father of flamegraphs' Brendan Gregg has provided [a great deep dive](http://queue.acm.org/detail.cfm?id=2927301) that also has some entertaining historical context.

###### Instructions
In order to configure your FreeBSD instance to utilize this feature make the following changes to the configuration of the server. 

1. Load DTrace when the OS starts - edit `/boot/loader.conf` or `/boot/loader.local.conf` add the line `dtraceall_load="YES"` You can also load it without rebooting by running `kldload dtraceall`

1. Next we need to allow the kernel to load DTrace Object Files greater that 128k - edit `/etc/sysctl.conf` and add
`kern.dtrace.helper_actions_max=16000` Again you can run this without a reboot with `# sysctl -w kern.dtrace.helper_actions_max=16000`

1. Install the build tools
`# pkg install python gcc git gmake`

1. Now install node.js for FreeBSD from ports to get the latest stable release.
`# portsnap fetch`<br/>
`# portsnap extract`<br/> 
`# cd /usr/ports/www/node6`<br/>
`# make install clean` - Choose the default options
1. npm is also required  
`# cd /usr/ports/www/npm3` <br/>
`# make install clean`<br />
You may also want to [configure npm to install globals to the home directory](https://docs.npmjs.com/getting-started/fixing-npm-permissions#option-2-change-npms-default-directory-to-another-directory) so you don't have to `su` to often. 


1. Install [stackvis](https://github.com/joyent/node-stackvis) The visualisation tool managed by Dave Pacheco
`# npm install -g stackvis`

1. Get the OS source to compile the dtrace libs
`# curl http://ftp.freebsd.org/pub/FreeBSD/releases/amd64/11.0-RELEASE/src.txz > src.txz`

1. Then extract them into the default location 
`# tar -C / -xvf src.txz`

1. We now need to update stackvis. This is a little bit messy while [this patch](https://github.com/chrisa/node-dtrace-provider/pull/85) waits to land and stackvis will be updated.
`# cd /usr/local/lib/node_modules/stackvis/node_modules`<br/>
`# rm -fr dtrace-provider`<br/>
`# git clone https://github.com/no9/node-dtrace-provider.git`<br/>
`# mv node-dtrace-provider dtrace-provider`<br/>
`# cd dtrace-provider`<br/>
`# git submodule init`<br/>
`# git submodule update`<br/>
`# npm install`

You will now be able to follow the [flamegraphs](https://nodejs.org/en/blog/uncategorized/profiling-node-js/) tutorial mentioned earlier.

###### Summary
I hope you find this article useful. The ability to look at a runtime in this manor has saved me twice this year and I hope it will save you in the future too.
My next post on freeBSD and node.js will be looking at some scenarios on utilising the ZFS features.

###### Attribution 
The patch to the node-dtrace-provider is only a small part of this story - All the credit goes to [Fedor Indutny](https://github.com/indutny), [Brendon Gregg](https://github.com/brendangregg) and [Dave Pacheco](https://github.com/davepacheco) for sharing so much information and experience on this topic and making it interesting to get involved in.

  
