/*
	Copyright (C) 2017 Claude SIMON (http://q37.info/contact/).

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

const fs = require('fs');
const path = require('path');
const shared = require('./XDHqSHRD.js');

const types = shared.types;
const platforms = shared.platforms;
const platform = shared.platform;
const open = shared.open;

function isDev() {
	if (process.env.EPEIOS_SRC)
		return true;
	else
		return false;
}

function getEpeiosPath() {
	if (isDev) {
		if (platform == platforms.WIN32) {
			return "h:/hg/epeios/"
		} else {
			return "~/hg/epeios/"
		}
	} else
		throw "Error !";
}

// Returns the directory which contains all the assets, based on the directory from where the app. were launched.
function getAssetDir() {
	var dir = path.dirname(process.argv[1]);

	if (isDev()) {
		let epeiosPath = getEpeiosPath();
		return path.resolve(epeiosPath, "tools/xdhq/examples/common/", path.relative(path.resolve(epeiosPath, "tools/xdhq/examples/NJS/"), path.resolve(dir)));	// No final '/'.
	} else
		return path.resolve(dir);
}

function getAssetFileName(fileName) {
	return path.join(getAssetDir(), path.win32.basename(fileName))
}

function readAsset(fileName) {
	return Buffer.from(fs.readFileSync(getAssetFileName(fileName))).toString();
}

/*
To allow the use of embedded XSL, if the first character begins with '<'
(as an XML declaration), the parameter is considered containing XSL,
otherwise the file name containing the XSL.
*/

function readXSLAsset(xslContentOrFilename) {
	if (xslContentOrFilename[0] === '<')
		return xslContentOrFilename;
	else
		return readAsset(xslContentOrFilename);
}

const modes = {
	DEMO: 0,
	PROD: 1,
};

// {'a': b, 'c': d, 'e': f} -> ['a','c','e'] [b,d,f]
function split(keysAndValues, keys, values) {
	for (var prop in keysAndValues) {
		keys.push(prop);
		values.push(keysAndValues[prop]);
	}
}

// ['a', 'b', 'c'] ['d', 'e', 'f'] -> { 'a': 'd', 'b': 'e', 'c': 'f' }
function unsplit(keys, values) {
	var i = 0;
	var keysValues = {};

	while (i < keys.length) {
		keysValues[keys[i]] = values[i];
		i++;
	}

	return keysValues;
}

// 'key', value -> { 'key': value } 
function merge(key, value) {
	var keyValue = {};

	keyValue[key] = value;

	return keyValue;
}

var xdhq;
var call;

function launch(callback, action, tagsAndCallbacks, head, mode) {
	switch (mode) {
		case modes.DEMO:
			xdhq = require('./XDHqDEMO.js');
			break;
		case modes.PROD:
			xdhq = require('./XDHqPROD.js');
			break;
		default:
			throw "Unknown mode !!!";
			break;
	}

	call = xdhq.call;
	xdhq.launch(callback, action, tagsAndCallbacks, head );
}

class XDH {
	execute(script, callback) {
		call(this, "Execute_1", types.STRING, 1, script, 0, callback);
	}
	alert(message, callback) {
		call(this, "Alert_1", types.VOID, 1, message, 0, callback);
	}
	confirm(message, callback) {
		call(this, "Confirm_1", types.STRING, 1, message, 0, (answer) => callback(answer == "true"));
	}
	setLayout_(id, xml, xsl, callback) {
		call(this, "SetLayout_1", types.VOID, 3, id, xml, xsl, 0, callback);
	}
	setLayout(id, html, callback) {
		this.setLayout_(id, html, "", callback);
	}
	setLayoutXSL(id, xml, xslFilename, callback) {
		let xslURL = xslFilename;

		if (this._xdhIsDEMO)
			xslURL = "data:text/xml;charset=utf-8," + encodeURIComponent(readXSLAsset(xslFilename));

		if (typeof (xml) !== "string")
			xml = xml.toString();

		this.setLayout_(id, xml, xslURL, callback);
	}
	getContents(ids, callback) {
		call(this, "GetContents_1", types.STRINGS, 0, 1, ids,
			(contents) => callback(unsplit(ids, contents))
		);
	}
	getContent(id, callback) {
		return this.getContents([id], (result) => { callback(result[id]); });
	}
	setContents(idsAndContents, callback) {
		var ids = [];
		var contents = [];

		split(idsAndContents, ids, contents);

		call(this, "SetContents_1", types.VOID, 0, 2, ids, contents, callback);
	}
	setContent(id, content, callback) {
		return this.setContents(merge(id, content), callback);
	}
	setTimeout( delay, action, callback )
	{
		call(this, "SetTimeout_1", types.VOID, 2, delay.toString(), action, 0, callback);
	}
	createElement_(name, id, callback ) {
		call( this, "CreateElement_1", types.STRING, 2, name, id, 0, callback )
	}
	createElement(name, idOrCallback, callback ) {
		if (typeof (idOrCallback) === "string")
			return this.createElement_(name, idOrCallback, callback);
		else
			return this.createElement_(name, "", idOrCallback);
	}
	insertChild(child, id, callback) {
		call(this, "InsertChild_1", types.VOID, 2, child, id, 0, callback);
	}
	dressWidgets(id, callback) {
		call(this, "DressWidgets_1", types.VOID, 1, id, 0, callback);
	}
	handleClasses(idsAndClasses, command, callback) {
		var ids = [];
		var classes = [];

		split(idsAndClasses, ids, classes);

		call(this, command, types.VOID, 0, 2, ids, classes, callback);
	}
	addClasses(idsAndClasses, callback) {
		this.handleClasses(idsAndClasses, "AddClasses_1", callback);
	}
	addClass(id, clas, callback) {
		this.addClasses(merge(id, clas), callback);
	}
	removeClasses(idsAndClasses, callback) {
		this.handleClasses(idsAndClasses, "RemoveClasses_1", callback);
	}
	removeClass(id, clas, callback) {
		this.removeClasses(merge(id, clas), callback);
	}
	toggleClasses(idsAndClasses, callback) {
		this.handleClasses(idsAndClasses, "ToggleClasses_1", callback);
	}
	toggleClass(id, clas, callback) {
		this.toggleClasses(merge(id, clas), callback);
	}
	enableElements(ids, callback) {
		call(this, "EnableElements_1", types.VOID, 0, 1, ids, callback);
	}
	enableElement(id, callback) {
		this.enableElements([id], callback);
	}
	disableElements(ids, callback) {
		call(this, "DisableElements_1", types.VOID, 0, 1, ids, callback);
	}
	disableElement(id, callback) {
		this.disableElements([id], callback);
	}
	setAttribute(id, name, value, callback) {
		call(this, "SetAttribute_1", types.VOID, 3, id, name, value, 0, callback);
	}
	getAttribute(id, name, callback) {
		return call(this, "GetAttribute_1", types.STRING, 2, id, name, 0, callback);
	}
	removeAttribute(id, name, callback) {
		call(this, "RemoveAttribute_1", types.VOID, 2, id, name, 0, callback);
	}
	setProperty(id, name, value, callback) {
		call(this, "SetProperty_1", types.VOID, 3, id, name, value, 0, callback);
	}
	getProperty(id, name, callback) {
		return call(this, "GetProperty_1", types.STRING, 2, id, name, 0, callback);
	}
	focus(id, callback) {
		call(this, "Focus_1", types.VOID, 1, id, 0, callback);
	}
}

module.exports.componentInfo = () => njsq._componentInfo(xdhq);
module.exports.wrapperInfo = () => njsq._wrapperInfo();
module.exports.returnArgument = (text) => { return njsq._call(xdhq, 0, text) };

module.exports.launch = launch;
module.exports.XDH = XDH;
module.exports.modes = modes;

module.exports.XML = require("./XDHqXML").XML;

// Following functions are dev helper.
module.exports.isDev = isDev;
module.exports.getAssetDir = getAssetDir;
module.exports.getAssetFileName = getAssetFileName;
module.exports.readAsset = readAsset;
module.exports.open = open;
