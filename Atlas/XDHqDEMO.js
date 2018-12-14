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

var pAddr = "atlastk.org";
var pPort = 53800;
var wAddr = "";
var wPort = "";
var cgi = "xdh";

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
	console.log( "\tDEV mode !")
	break;
case 'TEST':
	cgi = "xdh_";
	console.log("\tTEST mode !")
	break;
case '':
	break;
default:
	throw "Bad 'ATK' environment variable value : should be 'DEV' or 'TEST' !";
	break;
}

pAddr = getEnv("ATK_PADDR", pAddr);
pPort = parseInt(getEnv("ATK_PPORT", pPort.toString()));
wAddr = getEnv("ATK_WADDR", wAddr);
wPort = getEnv("ATK_WPORT", wPort);

if (wAddr == "")
	wAddr = pAddr;

if (wPort != "")
	wPort = ":" + wPort;

const shared = require('./XDHqSHRD.js');
const net = require('net');

const types = shared.types;
const open = shared.open;

const protocolLabel = "3f0aef6b-b893-4ccd-9316-d468588fc572";
const protocolVersion = "0";

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

	while (size != 0) {
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

	while (buffer = socket.read())
		query = Buffer.concat([query, buffer]);

	return query;
}

function getId(query) {
	return getString(query, 0)[0];
}

function getAction(query) {
	return getString(query, getSize(query, 0)[0] + 1)[0];
}

function getResponse(query, type) {
	switch (type) {
		case types.UNDEFINED:
			throw "This function should not be called with UNDEFINED type !!!";
			break;
		case types.VOID:
			throw "The VOID type should be handled upstream !!!";
			break;
		case types.STRING:
			return getString(query, 0)[0];
			break;
		case types.STRINGS:
			return getStrings(query, 0)[0];
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

function standBy(socket) {
	socket.write(Buffer.from("StandBy_1\x00"));
}

function isTokenEmpty() {
	return ( token == "" ) || ( token.charAt( 0 ) == '&' );
}

function pseudoServer(createCallback, callbacks, head) {
	var client = new net.Socket();

	client.connect(pPort, pAddr, () => {
		let relaunch = true;

		client.write(handleString(token));

		if ( isTokenEmpty() ) {
			if (head === undefined)
				head = "";
			client.write(handleString(head));
		}

		client.on('readable', () => {
			if (client._xdhDOM === undefined) {
				let offset = 0;
				let query = getQuery(client);
				let errorMessage = "";

				if (isTokenEmpty()) {
					[token, offset] = getString(query, offset);

					if (isTokenEmpty())
						throw "Bad connection information !!!";

					if (wPort != ":0") {
						let completeURL = "http://" + wAddr + wPort + "/" + cgi + ".php?_token=" + token;

						console.log(completeURL);
						console.log("Open above URL in a web browser. Enjoy!");

						open(completeURL);
					} else {
						let returnedToken = "";

						[returnedToken, offset] = getString(query, offset);

						if (returnedToken != token)
							throw "Unmatched token !!!";
					}
				}

				client._xdhDOM = createCallback(client);
				client._xdhDOM._xdhSocket = client;
				client._xdhDOM._xdhIsDEMO = true;
				client._xdhDOM._xdhType = types.UNDEFINED;
				client.write(addString(addString(Buffer.from(""), protocolLabel), protocolVersion));
			} else if (relaunch) {
				let query = ""
				let offset = 0;
				let errorMessage = "";

				pseudoServer(createCallback, callbacks);	// Useless to give 'head', as it will no more be used.

				query = getQuery(client);

				[errorMessage, offset] = getString(query, offset);

				if (errorMessage != "")
					throw (errorMessage);

				getString(query, offset);	// Language.

				client.write(handleString("NJS"));

				relaunch = false;
			} else {
				let query;

				let cont = true;

				query = getQuery(client);

				if (client._xdhDOM._xdhType === types.UNDEFINED) {
					let id, action;

					id = getId(query);
					action = getAction(query);

					callbacks[action](client._xdhDOM, id);

					if (client._xdhDOM._xdhType === types.UNDEFINED) {
						cont = false;
						standBy(client);
					}  else
						cont = client._xdhDOM._xdhType === types.VOID;
				}

				while (cont) {
					if (client._xdhDOM._xdhCallback != undefined) {
						let type = client._xdhDOM._xdhType;
						client._xdhDOM._xdhType = types.UNDEFINED;
						if (type === types.VOID)
							client._xdhDOM._xdhCallback();
						else
							client._xdhDOM._xdhCallback(getResponse(query, type));
						if (client._xdhDOM._xdhType === types.UNDEFINED) {
							cont = false;
							standBy(client);
						} else if (client._xdhDOM._xdhType !== types.VOID)
							cont = false;
					} else {
						if (client._xdhDOM._xdhType !== types.VOID)
							getResponse(query, client._xdhDOM._xdhType);
						client._xdhDOM._xdhType = types.UNDEFINED;
						cont = false;
						standBy(client);
					}
				}
			}
		});
	});
	client.on('error', (err) => {
		throw "Unable to connect to '" + pAddr + ":" + pPort + "' !!!";
	});
}

function launch(createCallback, callbacks, head) {
	if (process.env.EPEIOS_SRC) {
		console.log("DEMO mode !");
	}

	setTimeout(() => pseudoServer(createCallback, callbacks, head), 1000);

}

function add(data, argument) {
	if (typeof (argument) === "string")
		return addString(data, argument);
	else if (typeof (argument) === "object")
		return addStrings(data, argument);
	else
		throw "Unexpected argument type: " + typeof (argument);
}

function call(dom, command, type) {
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
