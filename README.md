Developer Mode Service
======================

Summary
-------
Node.js implementation of the com.palm.service.devmode Developer Mode Service.

Description
-----------
This node.js service responds to system bus requests made to com.palm.service.devmode/getDevMode and setDevMode.

API
---
getDevMode: returns true if developer mode is enabled
setDevMode: enables or disables developer mode (and restarts if mode changes)
getPassphrase: returns the passphrase used for the SSH key (te first 6 digits of the NDUID)

How to Build on Linux
=====================

Dependencies
------------
Below are the tools and libraries (and their minimum versions) required to build nodejs:

* cmake 2.8.7

Building
--------
Once you have downloaded the source, execute the following to build it:

    $ mkdir BUILD
    $ cd BUILD
    $ cmake ..
    $ make
    $ sudo make install

Installation
------------
This service could be made part of the DevMode app, or can be manually installed (e.g. into a webOS 3.0.5 emulator).

To manually install into an emulator target, try this (and then reboot or type "/usr/bin/ls-control scan-services"):
	novacom run -- file:///bin/mkdir -p /usr/palm/services/com.palm.service.devmode/
	for file in *.js* ; do novacom put file:///usr/palm/services/com.palm.service.devmode/$file < $file ; done
	novacom put file://usr/share/ls2/roles/pub/com.palm.service.devmode.json < files/sysbus305/com.palm.service.devmode.json
	novacom put file://usr/share/ls2/roles/prv/com.palm.service.devmode.json < files/sysbus305/com.palm.service.devmode.json
	novacom put file://usr/share/dbus-1/services/com.palm.service.devmode.service < files/sysbus305/com.palm.service.devmode.service
	novacom put file://usr/share/dbus-1/system-services/com.palm.service.devmode.service < files/sysbus305/com.palm.service.devmode.service

Before testing in a webOS 3.0.5 emulator, com.palm.service.devmode must be added to palm_jail_pardons in /usr/bin/run-js-service.

Testing
-------
From a device shell, the service can be tested as follows.  Note that if setDevMode changes state, the device will reboot.

	# kick ls2 to recognize service if just installed:
	root@qemux86:/# /usr/bin/ls-control scan-services

	root@qemux86:/# luna-send -n 1 palm://com.palm.service.devmode/getDevMode '{}'
	{"enabled":false,"returnValue":true}

	root@qemux86:/# luna-send -P -a com.palmdts.devmode -n 1 palm://com.palm.service.devmode/setDevMode '{"enabled":true}'
	{"returnValue":true}

	root@qemux86:/# luna-send -n 1 palm://com.palm.service.devmode/getDevMode '{}'
	{"enabled":true,"returnValue":true}

	root@qemux86:/# luna-send -P -a com.palmdts.devmode -n 1 palm://com.palm.service.devmode/setDevMode '{"enabled":false}'
	{"returnValue":true}

	root@qemux86:/# luna-send -n 1 palm://com.palm.service.devmode/setDevMode '{"enabled":true}'
	{"returnValue":false,"errorText":"SetDevMode: Denied. Only DevMode app can call setDevMode.","errorCode":9}

	root@qemux86:/# luna-send -P -a com.palmdts.devmode -n 1 palm://com.palm.service.devmode/setDevMode '{"enabled":"bogus"}'
	{"returnValue":false,"errorText":"SetDevMode: enabled parameter must exist and be true or false","errorCode":42}

	root@qemux86:/# luna-send -P -a com.palmdts.devmode -n 1 palm://com.palm.service.devmode/getPassphrase '{}'
	{"passphrase": "123ABC", returnValue":true}

# Copyright and License Information

Copyright (c) 2013-2018 LG Electronics, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
