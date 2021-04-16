/*
MIT License

Copyright (c) 2017 Claude SIMON (https://q37.info/s/rmnmqd49)

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

"use strict";
const fs = require('fs');
const path = require('path');
const shared = require('./XDHqSHRD.js');

const types = shared.types;
const platforms = shared.platforms;
const platform = shared.platform;
const open = shared.open;

function isDev() {
	if (process.env.Q37_EPEIOS)
		return true;
	else
		return false;
}

function getEpeiosPath() {
	if (isDev()) {
		if (platform === platforms.WIN32) {
            return "h:/hg/epeios/";
		} else {
            return fs.realpathSync(process.env.Q37_EPEIOS);
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
	} else {
		return path.resolve(dir);
    }
}

function getAssetFileName(fileName) {
    return path.join(getAssetDir(), path.win32.basename(fileName));
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
	FAAS: 0,
	SFLH: 1
};

// {'a': b, 'c': d, 'e': f} -> ['a','c','e'] [b,d,f]
function split(keysAndValues, keys, values) {
	for (var prop in keysAndValues) {
		keys.push(prop.toString());
		values.push(keysAndValues[prop].toString());
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

function launch(callback, tagsAndCallbacks, head, mode) {
	switch (mode) {
		case modes.FAAS:
			xdhq = require('./XDHqFAAS.js');
			break;
		case modes.SLFH:
			xdhq = require('./XDHqSLFH.js');
			break;
		default:
			throw "Unknown mode !!!";
			break;
	}

	call = xdhq.call;
	xdhq.launch(callback, tagsAndCallbacks, head );
}

class XDH {
	execute_(type, script, callback) {
		call(this, "Execute_1", type, script, callback);
	}
	executeVoid(script, callback) {
		this.execute_(types.VOID, script, callback);
	}
	executeString(script, callback) {
		this.execute_(types.STRING, script, callback);
	}
	executeStrings(script, callback) {
		this.execute_(types.STRINGS, script, callback);
	}
	flush(id, callback) {
		call(this, "Flush_1", types.STRING, id, callback);
	}
	alert(message, callback) {
        call(this, "Alert_1", types.STRING, message, callback);
        // For the return value being 'STRING' instead of 'VOID',
        // see the 'alert' primitive in 'XDHqXDH'.
	}
	confirm(message, callback) {
		call(this, "Confirm_1", types.STRING, message, (answer) => callback(answer === "true"));
	}
	handleLayout_(variant, id, xml, xsl, callback) {
		if (typeof xml !== "string")
			xml = xml.toString();

		call(this, "HandleLayout_1", types.VOID, variant, id, xml, xsl, callback);
	}
	prependLayout(id, html, callback) {	// Depredated!
		this.handleLayout_("Prepend", id, html, "", callback);
	}
	inner(id, html, callback) {	// Depredated!
		this.handleLayout_("Set", id, html, "", callback);
	}
	appendLayout(id, html, callback) {	// Depredated!
		this.handleLayout_("Append", id, html, "", callback);
	}
	handleLayoutXSL_(variant, id, xml, xslFilename, callback) {
		let xslURL = xslFilename;

		if (this._xdh.isFAAS)
			xslURL = "data:text/xml;charset=utf-8," + encodeURIComponent(readXSLAsset(xslFilename));

		this.handleLayout_(variant, id, xml, xslURL, callback);
	}
	prependLayoutXSL(id, xml, xsl, callback) {	// Depredated!
		this.handleLayoutXSL_("Prepend", id, xml, xsl, callback);
	}
	setLayoutXSL(id, xml, xsl, callback) {	// Depredated!
		this.handleLayoutXSL_("Set", id, xml, xsl, callback);
	}
	appendLayoutXSL(id, xml, xsl, callback) {	// Depredated!
		this.handleLayoutXSL_("Append", id, xml, xsl, callback);
	}
	layout_(variant, id, xml, xslOrCallback, callback) {
		let xsl = "";

		if ( typeof xslOrCallback === "string")
			xsl = xslOrCallback;
		else
			callback = xslOrCallback;

		if ((xsl !== "") && this._xdh.isFAAS)
			xsl = "data:text/xml;charset=utf-8," + encodeURIComponent(readXSLAsset(xsl));

		call(this, "HandleLayout_1", types.VOID, variant, id, typeof xml === "string" ? xml : xml.toString(), xsl, callback);
	}
	before(id,xml,xslOrCallback,callback) {
		this.layout_("beforebegin", id, xml, xslOrCallback, callback);
	}
	begin(id,xml,xslOrCallback,callback) {
		this.layout_("afterbegin", id, xml, xslOrCallback, callback);
	}
	inner(id,xml,xslOrCallback,callback) {
		this.layout_("inner", id, xml, xslOrCallback, callback);
	}
	end(id,xml,xslOrCallback,callback) {
		this.layout_("beforeend", id, xml, xslOrCallback, callback);
	}
	after(id,xml,xslOrCallback,callback) {
		this.layout_("afterend", id, xml, xslOrCallback, callback);
	}
	getContents(ids, callback) {	// Deprecated
		call(this, "GetContents_1", types.STRINGS, ids,
			(contents) => callback(unsplit(ids, contents))
		);
	}
	getContent(id, callback) {	// Deprecated
		return this.getContents([id], (result) => { callback(result[id]); });
	}
	setContents(idsAndContents, callback) {	// Deprecated
		var ids = [];
		var contents = [];

		split(idsAndContents, ids, contents);

		call(this, "SetContents_1", types.VOID, ids, contents, callback);
	}
	setContent(id, content, callback) {	// Deprecated
		return this.setContents(merge(id, content), callback);
	}
	getValues(ids, callback) {
		call(this, "GetValues_1", types.STRINGS, ids,
			(values) => callback(unsplit(ids, values))
		);
	}
	getValue(id, callback) {
		return this.getValues([id], (result) => { callback(result[id]); });
	}
	setValues(idsAndValues, callback) {
		var ids = [];
		var values = [];

		split(idsAndValues, ids, values);

		call(this, "SetValues_1", types.VOID, ids, values, callback);
	}
	setValue(id, value, callback) {
		return this.setValues(merge(id, value), callback);
	}
	getMarks(ids, callback) {
		call(this, "GetMarks_1", types.STRINGS, ids,
			(marks) => callback(unsplit(ids, marks))
		);
	}
	getMark(id, callback) {
		return this.getMarks([id], (result) => { callback(result[id]); });
	}
	setMarks(idsAndMarks, callback) {
		var ids = [];
		var marks = [];

		split(idsAndMarks, ids, marks);

		call(this, "SetMarks_1", types.VOID, ids, marks, callback);
	}
	setMark(id, mark, callback) {
		return this.setMarks(merge(id, mark), callback);
	}
/*
	createElement_(name, id, callback ) {
        call(this, "CreateElement_1", types.STRING, 2, name, id, 0, callback);
    }
	createElement(name, idOrCallback, callback ) {
		if (typeof idOrCallback === "string")
			return this.createElement_(name, idOrCallback, callback);
		else
			return this.createElement_(name, "", idOrCallback);
	}
	insertChild(child, id, callback) {
		call(this, "InsertChild_1", types.VOID, 2, child, id, 0, callback);
	}
*/
	handleClasses(idsAndClasses, variant, callback) {
		var ids = [];
		var classes = [];

		split(idsAndClasses, ids, classes);

		call(this, "HandleClasses_1", types.VOID, variant, ids, classes, callback);
	}
	addClasses(idsAndClasses, callback) {
		this.handleClasses(idsAndClasses, "Add", callback);
	}
	addClass(id, clas, callback) {
		this.addClasses(merge(id, clas), callback);
	}
	removeClasses(idsAndClasses, callback) {
		this.handleClasses(idsAndClasses, "Remove", callback);
	}
	removeClass(id, clas, callback) {
		this.removeClasses(merge(id, clas), callback);
	}
	toggleClasses(idsAndClasses, callback) {
		this.handleClasses(idsAndClasses, "Toggle", callback);
	}
	toggleClass(id, clas, callback) {
		this.toggleClasses(merge(id, clas), callback);
	}
	enableElements(ids, callback) {
		call(this, "EnableElements_1", types.VOID, ids, callback);
	}
	enableElement(id, callback) {
		this.enableElements([id], callback);
	}
	disableElements(ids, callback) {
		call(this, "DisableElements_1", types.VOID, ids, callback);
	}
	disableElement(id, callback) {
		this.disableElements([id], callback);
	}
	setAttribute(id, name, value, callback) {
		call(this, "SetAttribute_1", types.VOID, id, name, value, callback);
	}
	getAttribute(id, name, callback) {
		return call(this, "GetAttribute_1", types.STRING, id, name, callback);
	}
	removeAttribute(id, name, callback) {
		call(this, "RemoveAttribute_1", types.VOID, id, name, callback);
	}
	setProperty(id, name, value, callback) {
		call(this, "SetProperty_1", types.VOID, id, name, value, callback);
	}
	getProperty(id, name, callback) {
		return call(this, "GetProperty_1", types.STRING, id, name, callback);
	}
	focus(id, callback) {
		call(this, "Focus_1", types.VOID, id, callback);
	}
	parent(id, callback) {
		return call(this, "Parent_1", types.STRING, id, callback);
	}
	firstChild(id, callback) {
		return call(this, "FirstChild_1", types.STRING, id, callback);
	}
	lastChild(id, callback) {
		return call(this, "LastChild_1", types.STRING, id, callback);
	}
	previousSibling(id, callback) {
		return call(this, "PreviousSibling_1", types.STRING, id, callback);
	}
	nextSibling(id, callback) {
		return call(this, "NextSibling_1", types.STRING, id, callback);
	}
	scrollTo(id, callback) {
		call(this, "ScrollTo_1", types.VOID, id, callback);
	}
}

module.exports.componentInfo = () => njsq._componentInfo(xdhq);
module.exports.wrapperInfo = () => njsq._wrapperInfo();
module.exports.returnArgument = (text) => { return njsq._call(xdhq, 0, text); };

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
module.exports.broadcastAction = (action, id) => xdhq.broadcastAction(action, id);
