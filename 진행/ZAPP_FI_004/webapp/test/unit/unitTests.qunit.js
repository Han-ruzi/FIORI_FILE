/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsmilegate/zapp_fi_004/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
