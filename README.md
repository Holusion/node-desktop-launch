# node-desktop-launch
Open files using freedesktop's Desktop Entry and Shared-MIME specifications

[![Build Status](https://travis-ci.org/Holusion/node-desktop-launch.svg?branch=master)](https://travis-ci.org/Holusion/node-desktop-launch)
[![Test Coverage](https://codeclimate.com/github/Holusion/node-desktop-launch/badges/coverage.svg)](https://codeclimate.com/github/Holusion/node-desktop-launch/coverage)

parse the Exec key of desktop entry files to launch a program opening the target file.

### Usage :

    var Launcher = require("desktop-launch");
    var launcher = new launcher();
    launcher.start("path/to/file");

A convenience ```launcher.killChild()``` method is provided. The launcher class is designed to launch exactly one child at a time and will kill any remaining process on subsequent ```launcher.start("file")``` calls.
It's safe to call ```launcher.killChild()``` without knowing if the child_process is still alive.

### API

#### High Level

##### Methods
Only 2 methods should generally be used :

    launcher.start("filepath"); //To start a file using default associated app
    launcher.killChild(); //To force kill the child_process.

##### Events
the launcher will emit a few events in it's lifecycle. They are used internally and you can listen to them to know what's happening.

###### end

When the child process is closed. equivalent to `spawn()` **exit** event. It is not emitted when the child is killed with `killChild()` or by starting another child process to prevent race conditions : an end event dispatched **after** a new child is requested will lead the requester to think his child is terminated.

###### error

Transmit child process's errors.

##### Examples

```javascript
//You can give it a binary file :
launcher.start("/usr/bin/chromium") //open chromium with no args
//or a well known mimetype :
launcher.start("/path/to/index.html") //open your default browser at index.html
```

#### Low Level

Once can access member class *Finder* to provide it's own API:

    launcher.finder

It's behaviour is documented in the [xdg-aps](https://www.npmjs.com/package/xdg-apps) module. It's where most of the logic is.

### To Do

- Use dbus launch when available. I don't want to have dbus as a requirement though.

### How it works

The [xdg-aps](https://www.npmjs.com/package/xdg-apps) module yields a default opener for the given file. We build a command line from it's `Exec` informations and execute it. This module also provides (really simple) hypervisor functions, doing it's best to manage spawned processes.
