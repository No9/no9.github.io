---
title: "Debugging Rust with VSCode on FreeBSD"
published: true
date: "2018-12-28"
slug: "debugging-rust-with-vscode-on-freebsd"
author: "anton"
category: "tech"
tags:
  - programming
  - rust
  - freebsd
cover: "images/debug-rust.png"
---

The following is a set of notes for installing VSCode on FreeBSD and getting a debugger up and running in a step by step guide. I thought I would share them in a full post as having a full IDE with syntax and error highlighting along with detailed in-context explanations has been really useful as I get to grips with Rust.
![](./images/syntax.png)

If you find any errata then please [hit me up on twitter @dhigit9](https://twitter.com/dhigit9) and I will make the amendments.

There are four points we will walk through and it should take ~30 minutes.

 1. Install Required Dependencies 

 2. Setup Rust
 
 3. Install VSCode with Plugins

 4. Debug a Sample App

### Install Required Dependencies
As root run the following command:
```
# pkg install chromium gconf2 gdb git bash
```

To explain a little about these pre-reqs:
VSCode uses a lot of shared libraries from chromium so we need to add it. This should become less onerous as vscode/electon make it into ports but right now this is the state of affairs.
If you are using KDE then gconf2 is required. 
This tutorial uses gdb as the default installation of lldb on FreeBSD doesn't have the required python scripting support enabled. It may be possible to build lldb with python support from ports but this would add significantly to the setup time.

Finally we add bash to run the rustup scripts. 

### Setup Rust

Rust can be set up from pkg with `# pkg install rust` But the Rust Language Server (RLS) components in VSCode depend on [rustup](https://rustup.rs/) so we are going to use that in this scenario.
Please feel free to download and audit the script if you are not comfortable running random scripts from the internet.

I am also adding the default toolchain to be `nightly` as I will be using this in other tutorials but feel free to use `stable` if you would prefer.

```
% curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly
```

We will also need to add the cargo bin folder to your path. There are a number of ways to do this but I prefer editing my cshrc in `% ~/.cshrc`
Uncomment the set path line and add `$HOME/.cargo/bin`
```
set path = (/sbin /bin /usr/sbin /usr/bin /usr/local/sbin /usr/local/bin $HOME/bin /usr/local/lib/qt5/bin $HOME/.cargo/bin)
```

In order to get the code completion facilities with the rust plugins we should get the source and set up an environment variable to point to it.

```
% mkdir code
% cd code
% git clone https://github.com/rust-lang/rust.git
% cd rust
```
Get the sha1 for the nightly build
```
% rustc -V
rustc 1.33.0-nightly (e40548bc4 2018-12-21)
```
Now reset the code so it's in sync with the build
```
% git reset --hard e40548bc4
% HEAD is now at e40548bc43 Auto merge of #56779 - adrian-budau:master, r=alexcrichton
```
Now we need to setup an environment variable in `~/.cshrc` as we did for PATH so the plugins  know where to find it.
```
setenv RUST_SRC_PATH $HOME/code/rust/src
```

Now refresh your environment
```
% source ~/.cshrc
```

### Install VSCode with Plugins

Builds of VSCode are supplied from here - https://github.com/prash-wghats/Electron-VSCode-Atom-For-FreeBSD/releases

I am using 1.26.0 on FreeBSD-12.0-RELEASE with no issues you can download it directly from https://github.com/prash-wghats/Electron-VSCode-Atom-For-FreeBSD/releases/download/vscode_v1.26.0/VSCode-freebsd-x64-1.26.0.tar.xz

Once the download has completed expand the file 
```
$ tar xvf VSCode-freebsd-x64-1.26.0.tar.xz
```
Then link the binary to an executing folder in this example we use `$HOME/bin` as that was configured as part of the path config in the cargo setup. It's also called code as this is in my muscle memory from other operating systems.

```
% ln -s $HOME/VSCode-freebsd-x64-1.2.6.0/bin/code-oss ~/bin/code
```

Now start VSCode by running `% code` at a terminal.

Click the plugin button ![PlugingButton](https://i.ibb.co/bN4r8Zy/pluginbutton.png) and search for RLS and install.
![RLS Screen](https://i.ibb.co/tQLnhg7/buttons.png)

Repeat this process by searching for Native Debug
![Native Debug Screen](https://i.ibb.co/C6n02sP/native-debug.png)
 
Click the reload button to Refresh VSCode.

If everything is configured correctly you should be prompted to install the additional rust tooling by RLS.

Now we are ready to debug some code.

### Debug a Sample App

```
% cd ~/code
% cargo init sampleapp
% cd sampleapp
% code .
```
Navigate to the main source and set a breakpoint
![Set a Breakpoint Screen](https://i.ibb.co/Fqgf72M/setbreakpoint.png)

Now open a command prompt *CTL + \`* or navigate *View -> Terminal*
and run `% cargo build`
This will create an executable at `./target/debug/sampleapp`
![Build Screen](https://i.ibb.co/yYYgx63/build.png)

Now we are ready to debug!

Press *F5* or Click the *Debug -> Start Debug* menu

You will be prompted to select and environment - choose GDB.

You will then be asked to fill in the launch.json.
You can keep all the setting but point it too your debug build by setting the target to `./target/debug/sampleapp`

This is a full example.
```
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug",
            "type": "gdb",
            "request": "launch",
            "target": "./target/debug/sampleapp",
            "cwd": "${workspaceRoot}"
        }
    ]
}
```
If you save the file and press F5 again you should be dropped into the code at the breakpoint you created earlier with the call stack and more information available.
The right click context menu should also work for you too.

![Breakpoint Screen](https://i.ibb.co/x8LHFH2/debugging.png)

That's all for now but I will be posting more things as I find them and write them up. 
