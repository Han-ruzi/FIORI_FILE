/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"ANS/ypratice04/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
