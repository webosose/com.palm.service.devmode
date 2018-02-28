//devmode_service.js
var serviceName = "com.palm.service.devmode";

var Service = require("webos-service");
var node_fs = require("fs");
var pmlog = require("pmloglib");
var console = new pmlog.Console(serviceName);
var node_child = require("child_process");
var testMode = false;
if (process.argv.indexOf("--testmode") !== -1) {
		testMode = true;
		console.log("*** Test mode - reboot disabled ***");
}

var service = new Service(serviceName);
service.register("getDevMode", function(message) {
	//console.log(">>>>>>> in GetDevModeCommandAssistant");
	console.log ("%j", message.payload);

	var prefs_dir = "/var/luna/preferences/";
	var enabled_file = prefs_dir+"devmode_enabled";
	var is_enabled = false;

	// Is DevMode currently on?
	try {
		node_fs.openSync(enabled_file, 'r');
		is_enabled = true;
	} catch(err) {}

	console.log ("DevMode is currently " + (is_enabled ? "enabled" : "disabled"));

	// Return enabled=true if file exists, which should mean DevMode is on
	// (since we force a reboot immediately after enabling or disabling it)
	message.respond({"enabled":is_enabled, "returnValue":true});
});

service.register("setDevMode", function(message) {
	console.log("%j", message.payload);

	var callingAppID = message.sender;
	var set_enabled = message.payload.enabled;
	// If calling from the test script, don't reboot. But require that the service is started in a particular test mode
	if (callingAppID === "com.palm.service.devmode.test") {
		if (!testMode) {
			message.respond({
				returnValue: false,
				errorText: "SetDevMode: Test mode not enabled. Restart devmode service with --testmode option",
				errorCode:  10
			});
			return;
		}
	}
	// NOTE: Add com.palm.service.devmode to palm_jail_pardons in /usr/bin/run-js-service
	// if palm_jail is re-enabled (so we can write to /var/luna/preferences)
	var prefs_dir = "/var/luna/preferences/";
	var enabled_file = prefs_dir + "devmode_enabled";
	var is_enabled = false;
	var reboot_needed = false;

	// Is DevMode currently on?
	try {
		node_fs.openSync(enabled_file, 'r');
		is_enabled = true;
	} catch(err) {}

	console.log("DevMode was " + (is_enabled ? "enabled" : "disabled"));

	if (typeof set_enabled === "boolean") {
		if (set_enabled) {
			// Request to turn DevMode ON
			if (!is_enabled) {
				// Create DevMode file
				node_fs.writeFileSync(enabled_file, "", 'utf8', function(err) {
					if (err) {
						message.respond({
							errorText: "write of "+enabled_file+" failed",
							errorCode: 1,
							returnValue: false
						});
						return;
					}
				});

				try {
					node_fs.openSync(prefs_dir + "dc0", 'r');
				} catch(err) {}

				node_fs.writeFileSync(prefs_dir + "dc0", "", 'utf8', function(err) {
					if (err) {
						message.respond({
							errorText: "write of "+prefs_dir + "dc0"+" failed",
							errorCode: 1,
							returnValue: false
						});
						return;
					}
				});

				// And reboot!
				reboot_needed = true;
			}
		} else {
			// Request to turn DevMode OFF
			if (is_enabled) {
				// Remove DevMode file
				node_fs.unlinkSync(enabled_file);

				for(i = 0 ; i < 10 ; i++)
				{
					try {
						node_fs.unlinkSync(prefs_dir + "dc" + i);
					} catch(err) {}
				}

				// And reboot!
				reboot_needed = true;
			}
		}
	} else {
		// "enabled" parameter was missing or not boolean
		message.respond({
			returnValue: false,
			errorText: "SetDevMode: enabled parameter must exist and be true or false",
			errorCode:  42
		});
		return;
	}

	if (reboot_needed) {
		if (!testMode) {
			node_child.exec("reboot", function(err) {
				if (err) {
					message.respond({
						errorText: "exec of 'reboot' failed",
						message: error.toString(),
						returnValue: false,
						errorCode: 3
					});
				}
			});
		} else {
			console.log("skipping reboot");
		}
	}

	message.respond({
		"returnValue": true
	});
});

service.register("getPassphrase", function(message) {
	var callingAppID = message.sender;
	service.call("luna://com.palm.systemservice/deviceInfo/query", {parameters: ["nduid"]}, function(response) {
		if (response.payload.nduid) {
			message.respond({
				passphrase: response.payload.nduid.slice(0,6).toUpperCase()
			});
		} else {
			message.respond({
				returnValue: false,
				errorText: "getPassphrase: nduid not received from systemservice",
				errorCode:  12
			});
		}
	});
});
