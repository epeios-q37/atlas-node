/*
MIT License

Copyright (c) 2018 Claude SIMON (https://q37.info/s/rmnmqd49)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
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
	if ( process.argv[2] === "W" )
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

function createHTML(rootTag) {

	if (typeof rootTag !== "string")
		rootTag = "";

	return new xdhq.XML(rootTag);
}

module.exports.launch = launch;
module.exports.createXML = createXML;
module.exports.DOM = xdhq.XDH;

module.exports.readAsset = xdhq.readAsset;
module.exports.modes = modes;
