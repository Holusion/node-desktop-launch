#!/bin/sh

eval "dbus-launch --sh-syntax --exit-with-session"
nyc ./node_modules/mocha/bin/_mocha
