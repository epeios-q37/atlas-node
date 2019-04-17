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