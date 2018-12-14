/*
	Copyright (C) 2018 Claude SIMON (http://q37.info/contact/).

	This file is part of XDHq.

	XDHq is free software: you can redistribute it and/or
	modify it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of the
	License, or (at your option) any later version.

	XDHq is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
	Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with XDHq. If not, see <http://www.gnu.org/licenses/>.
*/

"use strict"

const path = require('path');

var xdhqId = "";
var xdhwebqId = "";
var xdhelcqPath = "";
var xdhelcqBin = "";
var electronBin = "";

if (process.env.EPEIOS_SRC) {
	let epeiosToolsPath = "";
	let binPath = "";
	if (process.platform == 'win32') {
		epeiosToolsPath = "h:/hg/epeios/tools/";
		binPath = "h:/bin/";
	} else {
		epeiosToolsPath = "~/hg/epeios/tools/";
		binPath = ~/bin/
	}

	xdhqId = epeiosToolsPath + "xdhq/wrappers/NJS/XDHq.js";
	xdhwebqId = epeiosToolsPath + "xdhwebq/NJS/XDHWebQ.js";
	xdhelcqPath = epeiosToolsPath + "xdhelcq/";
	xdhelcqBin = path.join(binPath, "xdhqxdh");
	electronBin = xdhelcqPath + "node_modules/electron/dist/electron";
} else {
	xdhqId = "xdhq";
	/*
	xdhwebqId = "xdhwebq";
	xdhelcqPath = path.dirname(require.resolve("xdhelcq"));
	xdhelcqBin = require('xdhqxdh').fileName;
	electronBin = require("xdhelcq").electron;
	*/
}

const xdhq = require(xdhqId);
const isDev = xdhq.isDev;

const modes = xdhq.modes;

function launchWeb(dir) {
	require('child_process').fork(require(xdhwebqId).fileName, [dir]);
}

function launchDesktop(dir,prod) {
	if (prod) {
		require('child_process').spawn(electronBin, [path.join(xdhelcqPath, "index.js"), "-m=" + xdhelcqBin, dir]).on('close', function (code) {
			process.exit(code)
		});
	} else
		throw "DEMO mode not available with desktop interface !!!";
}

const guis = {
	NONE: 0,
	DESKTOP: 1,
	WEB: 2,
	DESKTOP_AND_WEB: 3
}

module.exports.guis = guis;

var mode;
var defaultGUI;

if (xdhq.isDev()) {
	mode = modes.PROD;
	defaultGUI = guis.DESKTOP;
} else {
	mode = modes.DEMO;
	defaultGUI = guis.NONE;
}

if (process.argv.length > 2)
	if ( process.argv[2] == "W" )
		mode = modes.DEMO;
	else
		mode = modes.PROD;
		

module.exports.mode = mode;

function launch(createCallback, callbacks, head, gui) {
	var dir = xdhq.getAssetDir();
	var arg = "";
	var prod = false;

	if ( process.argv.length > 2)
		arg = process.argv[2];

	if (gui === undefined) {
		if (arg != "") {
			switch (arg) {
				case "n":
				case "none":
					gui = guis.NONE;
					break;
				case "d":
				case "desktop":
					gui = guis.DESKTOP;
					break;
				case "W":
					gui = guis.NONE;
					break;
				case "w":
				case "web":
					gui = guis.WEB;
					break;
				case "dw":
				case "wd":
					gui = guis.DESKTOP_AND_WEB;
					break;
				default:
					throw ("Unknown gui !");
					break;
			}
		} else
			gui = defaultGUI;
	}

	prod = mode == modes.PROD;

	xdhq.launch(createCallback, callbacks, head, mode);

	switch (gui) {
		case guis.NONE:
			break;
		case guis.DESKTOP:
			launchDesktop(dir,prod);
			break;
		case guis.WEB:
			launchWeb(dir);
			break;
		case guis.DESKTOP_AND_WEB:
			launchDesktop(dir,prod);
			launchWeb(dir);
			break;
		default:
			throw ("Unknown gui !");
			break;
	}
}

function createXML(rootTag) {
	return new xdhq.XML(rootTag);
}

module.exports.launch = launch;
module.exports.createXML = createXML;
module.exports.DOM = xdhq.XDH;

module.exports.readAsset = xdhq.readAsset;
module.exports.modes = modes;
