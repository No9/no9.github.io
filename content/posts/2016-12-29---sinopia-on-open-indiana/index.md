---
title: "Sinopia on Open Indiana"
published: true
date: "2016-12-29"
slug: "/sinopia-on-open-indiana"
author: "anton"
category: "tech"
tags:
  - programming
  - nodejs
cover: "https://unsplash.it/1280/500/?random?BoldMage"
---

This article is just a quick set of notes that I took while setting up [Sinopia](https://github.com/rlidwka/sinopia) on [OpenIndiana](http://www.openindiana.org/). It should be useful if you are looking to set up any [node.js](https://nodejs.org) processes on [illumOS](http://wiki.illumos.org/display/illumos/illumos+Home) based operating systems.  

[Sinopia](https://github.com/rlidwka/sinopia) is an open source private/caching npm repository server. It's super simple to setup and very handy as it works as an offline repository.

**Install**

```
$ npm install sinopia -g
```

Now to ensure that it runs as a service on openindiana you need to do the following steps: 

Create a sinopia-manifest.xml as defined below and change the `envvar PATH`, `envvar HOME` and `exec_method exec` locations to match your machine.
<sub>N.B. I am calling node directly rather than running sinopia command to illustrate how to configure a node application in general</sub>

You can find the values for those attributes through the usual commands
```
$ echo $PATH
/usr/local/bin:/usr/gnu/bin:/usr/bin:/usr/sbin:/sbin/opt/local/sbin:/opt/local/bin:/home/anton/tools/bin
$ echo $HOME
/home/anton
$ which node
/usr/local/bin/node
$ npm root -g
/home/anton/tools/lib/node_modules
```

**Check Service Depdendancies**

There are dependencies on network and filesystem services being available. These are defined in `dependency` tags.
The `service_fmri` can vary in illumOS distros so double check the names by listing the services. 
`$ svcs` will list all services along with there qualified names

i.e. 
```
...
online          7:38:01 svc:/network/service:default
online          7:38:10 svc:/network/routing-setup:default
....
```

**sinopia-manifest.xml**

[Download it here](https://gist.githubusercontent.com/No9/472cc7f5bb9cc581735c40d0f4a0ed0c/raw/bcc790f1ecf872b4858ffe574c8be3731d188d02/sinopia-manifest.xml)
```
<?xml version="1.0"?>
<!DOCTYPE service_bundle SYSTEM "/usr/share/lib/xml/dtd/service_bundle.dtd.1">
<service_bundle type="manifest" name="sinopia">
  <service name="site/sinopia" type="service" version="1">

    <create_default_instance enabled="true"/>

    <single_instance/>

    <dependency name="network" grouping="require_all" restart_on="refresh" type="service">
      <service_fmri value="svc:/network/service:default"/>
    </dependency>

    <dependency name="filesystem" grouping="require_all" restart_on="refresh" type="service">
      <service_fmri value="svc:/system/filesystem/local"/>
    </dependency>

    <method_context working_directory="/home/anton/tools/bin">
      <method_credential user="anton" group="staff" privileges='basic,net_privaddr'  />
      <method_environment>
        <envvar name="PATH" value="/usr/local/bin:/usr/gnu/bin:/usr/bin:/usr/sbin:/sbin/opt/local/sbin:/opt/local/bin:/home/anton/tools/bin"/>
        <envvar name="HOME" value="/home/anton"/>
      </method_environment>
    </method_context>

    <exec_method
      type="method"
      name="start"
      exec="/usr/local/bin/node /home/anton/tools/lib/node_modules/sinopia/lib/cli.js "
      timeout_seconds="60"/>

    <exec_method
      type="method"
      name="stop"
      exec=":kill"
      timeout_seconds="60"/>

    <property_group name="startd" type="framework">
      <propval name="duration" type="astring" value="child"/>
      <propval name="ignore_error" type="astring" value="core,signal"/>
    </property_group>

    <property_group name="application" type="application">

    </property_group>


    <stability value="Evolving"/>

    <template>
      <common_name>
        <loctext xml:lang="C">node.js sinopia service</loctext>
      </common_name>
    </template>

  </service>

</service_bundle>

```
**Verify your changes**
```
$ svccfg validate sinopia-manifest.xml 
```
Now as root:
**Import the service** 

```
# svccfg import sinopia-manifest.xml
```

**Start the service**
```
# svcadm enable site/sinopia
```

Sinopia should now be running and available on http://localhost:4873/

You should now set npm to use it as a cache and your done.
```
$ npm set registry http://localhost:4873/
```

**If things go wrong**

If the import went ok but the site isn't there check the service logs.
You can find out info on a service with svcs
```
# svcs -x site/sinopia
svc:/site/sinopia:default (node.js sinopia service)
 State: online since  2 July 2016 09:33:46 IST
   See: /var/svc/log/site-sinopia:default.log
Impact: None.
```
This will tell you where the logs are and you can use that to trouble shoot issues.

Hope you found this useful and [hit me up on twitter](https://twitter.com/dhigit9) if you want more info.  