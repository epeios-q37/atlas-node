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

// Types of the response.
const types = {
	VOID: 0,
	STRING: 1,
	STRINGS: 2,
	UNDEFINED: 3 // Always the highest value.
}

const platforms = {
	ANDROID: 0,
	AIX: 1,
	DARWIN: 2,
	FREEBSD: 3,
	LINUX: 4,
	OPENBSD: 5,
	SUNOS: 6,
	WIN32: 7,
	UNKNOWN: 8
}

const platform = (() => {
	let platform = platforms.UNKNOWN;

	switch (process.platform) {
		case 'android':
			platform = platforms.ANDROID;
			break;
		case 'aix':
			platform = platforms.AIX;
			break;
		case 'darwin':
			platform = platforms.DARWIN;
			break;
		case 'freebsd':
			platform = platforms.FREEBSD;
			break;
		case 'linux':
			platform = platforms.LINUX;
			break;
		case 'openbsd':
			platform = platforms.OPENBSD;
			break;
		case 'sunos':
			platform = platforms.SUNOS;
			break;
		case 'win32':
			platform = platforms.WIN32;
			break;
		default:
			throw "Unknown platform: '" + process.platform + "' !!!";
			break;
	}

	return platform;
})();

function open(document) {
	var command = "";
	var available = false;
	switch (platform) {
		case platforms.DARWIN:
			command = "open " + document;
			available = true;
			break;
		case platforms.AIX:
		case platforms.ANDROID:
		case platforms.FREEBSD:
		case platforms.LINUX:
		case platforms.OPENDBSD:
		case platforms.SUNOS:
			command = "xdg-open " + document;
			available = true;
			break;
		case platforms.WIN32:
			command = "start " + document;
			available = true;
			break;
		default:
			break;
	}

	if (available)
		require('child_process').exec(command);

	return available;
}

module.exports.types = types;
module.exports.platforms = platforms;
module.exports.platform = platform;
module.exports.open = open;