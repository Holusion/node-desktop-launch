# node-desktop-launch
Open files using freedesktop's Desktop Entry and Shared-MIME specifications

[![Build Status](https://travis-ci.org/Holusion/node-desktop-launch.svg?branch=master)](https://travis-ci.org/Holusion/node-desktop-launch)


parse the Exec key of desktop entry files to launch a program opening the target file.

### Usage :

    var Launcher = require("desktop-launch");
    var launcher = new launcher();
    launcher.start("path/to/file");

A convenience ```launcher.killChild()``` method is provided. The launcher class is designed to launch exactly one child at a time and will kill any remaining process on subsequent ```launcher.start("file")``` calls.
It's safe to call ```launcher.killChild()``` without knowing if the child_process is still alive.

### API

#### High Level

Only 2 methods should generally be used :

    launcher.start("filepath"); //To start a file using default associated app
    launcher.killChild(); //To force kill the child_process.

#### Low Level

Once can access member class *Finder* to provide it's own API:

    launcher.finder

It's behaviour is documented in the [xdg-aps](https://www.npmjs.com/package/xdg-apps) module

### To Do

- test coverage is not too bad but lacks diversity on fixtures. It would do no harm to test on a wider variety of examples
- totally décorelate testing from system (still check $HOME dir's entries)
- Use dbus launch when available
- test priority over multiple competing entries

### How it works

First the program will determine the file's MIME type via the ```mime/globs2``` file. No libmagic support is available yet. Then it will match it against registered default applications and (if necessary) registered capable applications.

If an app is found capable of opening the file it will be launched as specified by the app entry's **Exec** key.

Internally, it uses [xdg-basedirs](https://github.com/sindresorhus/xdg-basedir) to know where it should search. Then it opens up all available files specified in freedesktop's [mime-app-spec](http://standards.freedesktop.org/mime-apps-spec/latest/ar01s02.html) that are not desktop specific.

**Namely :**

- $XDG_CONFIG_HOME/mimeapps.list	user overrides *(recommended location for user configuration GUIs)*
- $XDG_CONFIG_DIRS/mimeapps.list	*sysadmin and ISV overrides*
- $XDG_DATA_HOME/applications/mimeapps.list	*for compatibility, deprecated*
- $XDG_DATA_DIRS/applications/mimeapps.list	*distribution-provided defaults*

The [MimeApps](https://github.com/Holusion/node-desktop-launch/blob/master/lib/MimeApps.js) class takes care of creating a prioritized list of apps associated with mime types.

If no default app is found, [EntryList](https://github.com/Holusion/node-desktop-launch/blob/master/lib/EntryList.js) will return any app associated with this Mime Type.
