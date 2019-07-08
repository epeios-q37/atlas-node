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

var pAddr = "atlastk.org";
var pPort = 53800;
var wAddr = "";
var wPort = "";
var cgi = "xdh";
var instances = {};

function REPLit(url) {
	require('http').createServer(function (req, res) {
//		res.end("<html><body><iframe style=\"border-style: none; width: 100%;height: 100%\" src=\"" + url + "\"</iframe></body></html>");
		res.end("<html><body><iframe style=\"border-style: none; width: 100%;height: 100%\" src=\"https://atlastk.org/repl_it.php?url=" + url + "\"</iframe></body></html>");
	}).listen(8080);
}

function getEnv(name, value) {
	let env = process.env[name];

	if (env)
		return env.trim();
	else if (value)
		return value.trim();
	else
		return "";
}

switch (getEnv("ATK") ) {
case 'DEV':
	pAddr = "localhost";
	wPort = "8080";
    console.log("\tDEV mode !");
	break;
case 'TEST':
	cgi = "xdh_";
    console.log("\tTEST mode !");
	break;
case '':case 'REPLit':
	break;
default:
	throw "Bad 'ATK' environment variable value : should be 'DEV' or 'TEST' !";
	break;
}

pAddr = getEnv("ATK_PADDR", pAddr);
pPort = parseInt(getEnv("ATK_PPORT", pPort.toString()));
wAddr = getEnv("ATK_WADDR", wAddr);
wPort = getEnv("ATK_WPORT", wPort);

if (wAddr === "")
	wAddr = pAddr;

if (wPort !== "")
	wPort = ":" + wPort;

const shared = require('./XDHqSHRD.js');
const net = require('net');

const types = shared.types;
const open = shared.open;

const mainProtocolLabel = "6e010737-31d8-4be3-9195-c5b5b2a9d5d9";
const mainProtocolVersion = "0";

const demoProtocolLabel = "877c913f-62df-40a1-bf5d-4bb5e66a6dd9";
const demoProtocolVersion = "0";

function byteLength(str) {
	// returns the byte length of an utf8 string
	var s = str.length;
	for (var i = str.length - 1; i >= 0; i--) {
		var code = str.charCodeAt(i);
		if (code > 0x7f && code <= 0x7ff) s++;
		else if (code > 0x7ff && code <= 0xffff) s += 2;
		if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
	}
	return s;
}

function getByte(query, offset) {
	return [query[offset], offset + 1];
}

function getSize(query, offset) {
	var byte = query[offset++];
	var size = byte & 0x7f;

	while (byte & 0x80) {
		byte = query[offset++];

		size = (size << 7) + (byte & 0x7f);
	}

	return [size, offset];
}

function getString(query, offset) {
	var size = 0;
	[size, offset] = getSize(query, offset);

	return [query.toString("utf-8", offset, offset + size), offset + size];
}

function getStrings(query, offset) {
	var size = 0;
	var strings = new Array();
	var string = "";

	[size, offset] = getSize(query, offset);

	while (size--) {
		[string, offset] = getString(query, offset);
		strings.push(string);
	}

	return [strings, offset];
}

function convertSize(size) {
	var result = Buffer.alloc(1, size & 0x7f);
	size >>= 7;

	while (size !== 0) {
		result = Buffer.concat([Buffer.alloc(1, (size & 0x7f) | 0x80), result]);
		size >>= 7;
	}

	return result;
}

function addString(data, string) {
	return Buffer.concat([data, convertSize(byteLength(string)), Buffer.from(string, 'utf8')]);
}

function addStrings(data, strings) {
	var i = 0;
	data = Buffer.concat([data, convertSize(strings.length)]);

	while (i < strings.length)
		data = addString(data, strings[i++]);

	return data;
}

function handleString(string) {
	var data = new Buffer(0);

	data = addString(data, string);

	return data;
}

function getQuery(socket) {
	var buffer;
	var query = Buffer.alloc(0);

	while ((buffer = socket.read()))
		query = Buffer.concat([query, buffer]);

	return query;
}

function getResponse(query, offset, type) {
	switch (type) {
		case types.UNDEFINED:
			throw "This function should not be called with UNDEFINED type !!!";
			break;
		case types.VOID:
			throw "The VOID type should be handled upstream !!!";
			break;
		case types.STRING:
			return getString(query, offset)[0];
			break;
		case types.STRINGS:
			return getStrings(query, offset)[0];
			break;
		default:
			throw "Unknown response type !!!";
			break;
	}
}

function getToken() {
	return getEnv("ATK_TOKEN");
}

var token = getToken();

if (token !== "" )
	token = "&" + token;

function standBy(socket, instance) {
	socket.write(Buffer.concat([Buffer.alloc(1, instance._xdh.id), Buffer.from("StandBy_1\x00")]));
}

function isTokenEmpty() {
	return ( token === "" ) || ( token.charAt( 0 ) === '&' );
}

function createInstance(id, socket, createCallback) {
	var instance = createCallback();

	instance._xdh = new Object;

	instance._xdh.id = id;
	instance._xdh.socket = socket;
	instance._xdh.isDEMO = true;
	instance._xdh.type = types.UNDEFINED;
	instance._xdh.handshakeDone = false;

	return instance;
}

function instanceHandshake(instance, query, offset) {
	let errorMessage = "";

	[errorMessage, offset] = getString(query, offset);

	if (errorMessage !== "")
		throw (errorMessage);

	instance._xdh.handshakeDone = true;
}

function callCallback_(callback, instance, id, action) {
	switch (callback.length) {
		case 0:
			return callback();
		case 1:
			return callback(instance);
		case 2:
			return callback(instance, id);
		default:
			return callback(instance, id, action);
	}
}

function handleInstance(instance, callbacks, socket, query, offset) {
	let cont = true;

	if (instance._xdh.type === types.UNDEFINED) {
		let id, action;

		[id, offset] = getString(query, offset);
		[action, offset] = getString(query, offset);

		if ((action === "") || !("_PreProcess" in callbacks) || callCallback_(callbacks("_Preprocess", instance, id, action)))
			if (callCallback_(callbacks[action], instance, id, action) && ("_PreProcess" in callbacks))
				callCallback_(callbacks("_Postprocess", instance, id, action));

		if (instance._xdh.type === types.UNDEFINED) {
			cont = false;
			standBy(socket, instance);
		} else
			cont = instance._xdh.type === types.VOID;
	}

	while (cont) {	// Pending callbacks are handled as long as they don't have a return value.
		if (instance._xdh.callback !== undefined) {
			let type = instance._xdh.type;
			instance._xdh.type = types.UNDEFINED;
			if (type === types.VOID)
				instance._xdh.callback();
			else
				instance._xdh.callback(getResponse(query, offset, type));

			if (instance._xdh.type === types.UNDEFINED) {
				cont = false;
				standBy(socket, instance);
			} else if (instance._xdh.type !== types.VOID)
				cont = false;
		} else {
			if (instance._xdh.type !== types.VOID)
				getResponse(query, offset, instance._xdh.type);

			instance._xdh.type = types.UNDEFINED;
			cont = false;
			standBy(socket, instance);
		}
	}
}

function serve(socket, createCallback, callbacks) {
	let offset = 0;
	let query = getQuery(socket);
	let id = 0;
	
	[id, offset] = getByte(query, offset);

	if (id === 255) {	// Value corresponding a new front-end.
		[id, offset] = getByte(query, offset);	// Id of the new front-end.

		if (id in instances)
			throw "Instance of id  '" + id + "' exists but should not !";

		instances[id] = createInstance(id, socket, createCallback);
		socket.write(addString(addString(Buffer.alloc(1, id), mainProtocolLabel), mainProtocolVersion));
	} else {
		if ( !(id in instances ) )
			throw "Unknown instance of id '" + id + "'!";

		if (!instances[id]._xdh.handshakeDone) {
			instanceHandshake(instances[id], query, offset);
			socket.write(addString(Buffer.alloc(1, id), "NJS"));
		} else
			handleInstance(instances[id], callbacks, socket, query, offset);
	}
}

function ignition(socket, createCallback, callbacks) {
	let offset = 0;
	let query = getQuery(socket);

	socket.on('readable', () => serve(socket, createCallback, callbacks));

	[token, offset] = getString(query, offset);

	if (isTokenEmpty())
		throw getString(query, offset)[0];	// Displays error message.

	if (wPort !== ":0") {
		let completeURL = "https://" + wAddr + wPort + "/" + cgi + ".php?_token=" + token;

		console.log(completeURL);
		console.log(new Array(completeURL.length + 1).join('^'));
		console.log("Open above URL in a web browser. Enjoy!\n");

		if (getEnv("ATK") === "REPLit") {
			REPLit(completeURL);
//			console.log("\nIF THE PROGRAM DOES NOT WORK PROPERLY, PLEASE SEE http://q37.info/s/zbgfjtp9");
			console.log("IF THE PROGRAM DOES NOT WORK PROPERLY, YOU PROBABLY FORGOT TO FORK!");
			console.log("See http://q37.info/s/zbgfjtp9 for more details.");

		} else
			open(completeURL);
	}
}

function demoHandshake(socket, createCallback, callbacks, head) {
	let offset = 0;
	let error = "";
	let notification = "";
	let query = getQuery(socket);

	socket.once('readable', () => ignition(socket, createCallback, callbacks));

	[error, offset] = getString(query, offset);

	if (error !== "")
		throw error;

	[notification, offset] = getString(query, offset);

	if (notification !== "")
		console.log(notification);

	socket.write(handleString(token));

	if (head === undefined)
		head = "";

	socket.write(handleString(head));
}

function pseudoServer(createCallback, callbacks, head) {
	var socket = new net.Socket();

	socket.on('error', (err) => {
		throw "Error on connection to '" + pAddr + ":" + pPort + "' !!!";
	});

	socket.connect(pPort, pAddr, () => {
		socket.write(handleString(demoProtocolLabel));
		socket.write(handleString(demoProtocolVersion));

		socket.once('readable', () => demoHandshake(socket, createCallback, callbacks, head));
	});
}

function launch(createCallback, callbacks, head) {
	if (process.env.EPEIOS_SRC) {
		console.log("DEMO mode !");
	}

	setTimeout(() => pseudoServer(createCallback, callbacks, head), 0);
}

function add(data, argument) {
	if (typeof argument === "string")
		return addString(data, argument);
	else if (typeof argument === "object")
		return addStrings(data, argument);
	else
		throw "Unexpected argument type: " + typeof argument;
}

function call(instance, command, type) {
	let i = 3;
	let data = Buffer.concat([Buffer.alloc(1, instance._xdh.id), Buffer.from(command + '\x00')]);
	let amount = arguments[i++];

//	console.log( Date.now(), " Command: ", command, instance._xdh.id);

	instance._xdh.type = type;

	while (amount--)
		data = add(data, arguments[i++]);

	amount = arguments[i++];

	while (amount--)
		data = add(data, arguments[i++]);

	instance._xdh.callback = arguments[i++];

	instance._xdh.socket.write(data);
}


// Old
function call_(dom, command, type) {
	var i = 3;
	var data = Buffer.from(command + '\x00');
	var amount = arguments[i++];

	dom._xdhType = type;

	while (amount--)
		data = add(data, arguments[i++]);

	amount = arguments[i++];

	while (amount--)
		data = add(data, arguments[i++]);

	dom._xdhCallback = arguments[i++];

	dom._xdhSocket.write(data);
}

module.exports.launch = launch;
module.exports.call = call;
