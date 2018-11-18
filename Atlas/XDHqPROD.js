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

var affix = "xdhq";

var njsq = null;
var componentPath = null;
var componentFilename = null;
var path = require("path");
var xslPath = "./";
var epeiosToolsPath = "";

if (process.env.EPEIOS_SRC) {
	if (process.platform == 'win32') {
		componentPath = 'h:/bin/';
		epeiosToolsPath = "h:/hg/epeios/tools/";
		xslPath = path.join(epeiosToolsPath, "xdhq/servers/");
	} else {
		componentPath = '~/bin/';
		epeiosPath = "~/hg/epeios/tools/";
		xslPath = path.join(epeiosToolsPath, "xdhq/servers/");
	}
	njsq = require(componentPath + 'njsq.node');
} else {
	njsq = require('njsq');
	componentPath = __dirname;
}

componentFilename = path.join(componentPath, affix + "njs").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/ /g, "\\ ");
const xdhq = njsq._register(componentFilename);
// module.exports = njsq;

function call() {
	var args = [xdhq, 3];
	var i = 0;

	while (i < arguments.length)
		args.push(arguments[i++]);

	njsq._call.apply(null, args);
}

// {'a': b, 'c': d, 'e': f} -> ['a','c','e'] [b,d,f]
function split(keysAndValues, keys, values) {
	for (var prop in keysAndValues) {
		keys.push(prop);
		values.push(keysAndValues[prop]);
	}
}

function launch(callback, action, tagsAndCallbacks, head ) {
	console.log("PROD mode !");
	var tags = [];
	var callbacks = [];

	split(tagsAndCallbacks, tags, callbacks);

	njsq._call(xdhq, 1, tags, callbacks);

	njsq._call(xdhq, 2, callback, "53752", action);
}

module.exports.componentInfo = () => njsq._componentInfo(xdhq);
module.exports.wrapperInfo = () => njsq._wrapperInfo();
module.exports.returnArgument = (text) => { return njsq._call(xdhq, 0, text) };

module.exports.launch = launch;
module.exports.call = call;
