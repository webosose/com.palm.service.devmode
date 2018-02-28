
var serviceUri = "luna://com.palm.service.devmode";
var Service = require("webos-service");

// this will only work when running as root.
var handle = new Service("com.palm.service.devmode.test");

// Don't want to timeout after 5 seconds
handle.activityManager.create("keepAlive", function() {

});

function getMode(f) {
	handle.call(serviceUri+"/getDevMode", {}, function(message) {
		f(message.payload.enabled);
	});
}

function setMode(enabled, f) {
	handle.call(serviceUri+"/setDevMode", {enabled: enabled}, function(message) {
		f(message.payload);
	});
}

function getPassphrase(f) {
	handle.call(serviceUri+"/getPassphrase", {enabled: enabled}, function(message) {
		f(message.payload.passphrase);
	});
}

function enabled(bool) {
	if (bool) {
		return "enabled";
	}
	return "disabled";
}

/*
	Basic test:
	Get the current mode, change it to the opposite, then change it back
*/
getMode(function(originalSetting) {
	console.log("DevMode was " + enabled(originalSetting));
	setMode(!originalSetting, function(result) {
		if (!result.returnValue) {
			console.error("Couldn't set devmode to "+enabled(!originalSetting));
			console.error("Service Response:\n"+JSON.stringify(result));
			process.exit(1);
		} else {
			console.log("sucessfully changed setting");
		}
		getMode(function(newSetting) {
			if (newSetting == originalSetting) {
				console.error("Setting didn't actually change to "+enabled(!originalSetting));
				process.exit(2);
			} else {
				console.log("verified changed setting");
			}
			setMode(originalSetting, function(result) {
				if (!result.returnValue) {
					console.error("Couldn't set devmode to "+enabled(originalSetting));
					console.error("Service Response:\n"+JSON.stringify(result));
					process.exit(3);
				} else {
					console.log("sucessfully changed setting back");
				}
				getMode(function(finalSetting) {
					if (finalSetting !== originalSetting) {
						console.error("Setting didn't actually change back to "+enabled(originalSetting));
						process.exit(4);
					} else {
						console.log("verified changed setting back");
						console.log("SUCCESS: Changing back and forth seems to work");
						getPassphrase(function(passphrase){
							console.log("Passphrase for SSH key: "+passphrase);
							process.exit(0);
						});
					}
				});
			});
		});
	});
});
