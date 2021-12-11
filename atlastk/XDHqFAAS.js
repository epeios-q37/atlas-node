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

var pAddr = "faas.q37.info";
var pPort = 53700;
var wAddr = "";
var wPort = "";
var instances = {};
var socket = undefined;

function REPLit(url) {
	require('http').createServer(function (req, res) {
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

function exit_(message) {
	throw new Error(message);
}

switch (getEnv("ATK").toUpperCase()) {
case 'DEV':
	pAddr = "localhost";
	wPort = "8080";
    console.log("\tDEV mode !");
	break;
case 'TEST':
    console.log("\tTEST mode !");
	break;
case '':case 'REPLIT':case 'NONE':
	break;
default:
	exit_("Bad 'ATK' environment variable value : should be 'DEV' or 'TEST' !");
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
const isDev = shared.isDev;

const mainProtocolLabel = "22bb5d73-924f-473f-a68a-14f41d8bfa83";
const mainProtocolVersion = "0";

const faasProtocolLabel = "4c837d30-2eb5-41af-9b3d-6c8bf01d8dbf";
const faasProtocolVersion = "0";
const scriptVersion ="0";

var token = getEnv("ATK_TOKEN");

if (token !== "" )
	token = "&" + token;


function isTokenEmpty() {
	return ( token === "" ) || ( token.charAt( 0 ) === '&' );
}	

function byteLength(str) {
	// returns the byte length of an utf8 string
	let s = str.length;
	for (let i = str.length - 1; i >= 0; i--) {
		let code = str.charCodeAt(i);
		if (code > 0x7f && code <= 0x7ff) s++;
		else if (code > 0x7ff && code <= 0xffff) s += 2;
		if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
	}
	return s;
}

function convertUInt(value) {
	let result = Buffer.alloc(1, value & 0x7f);
	value >>= 7;

	while (value !== 0) {
		result = Buffer.concat([Buffer.alloc(1, (value & 0x7f) | 0x80), result]);
		value >>= 7;
	}

	return result;
}

function convertSInt(value) {
	return convertUInt(value < 0 ? ( ( -value - 1 ) << 1 ) | 1 : value << 1);
}

function sizeEmbeddedString(string) {
    return Buffer.concat([convertUInt(byteLength(string)), Buffer.from(string, 'utf8')]);
}

function addString(data, string) {
	return Buffer.concat([data, sizeEmbeddedString(string)]);
}

function addStrings(data, strings) {
	let i = 0;
	data = Buffer.concat([data, convertUInt(strings.length)]);

	while (i < strings.length)
		data = addString(data, strings[i++]);

	return data;
}

function handleString(string) {
	let data = new Buffer(0);

	data = addString(data, string);

	return data;
}

class Feeder {
	constructor(data) {
		this.data_ = data;
	}
	isEmpty() {
		return this.data_.length === 0;
	}
	get(size) {
		if ( this.data_.length === 0 )
			exit_("No data available!");

		if ( size > this.data_.length)
			size = this.data_.length;

		if ( size === 0 )
			exit_("'size' can not be 0!");

		let data = this.data_.subarray(0,size);

		this.data_ = this.data_.subarray(size);

		return data;
	}
}

var stack = new Array();

var uInt = 0;
var sInt = 0;
var length = 0;
var buffer = Buffer.alloc(0);
var string = "";
var amount = 0;
var strings = [];
var id = "";	// Buffers the action related id.
var cont = true;

/********/
/* DATA */
/********/

const d = {
	UINT: -1,
	SINT: -2,
	LENGTH: -3,
	CONTENT: -4,
	STRING: -5,
	AMOUNT: -6,
	SUBSTRING: -7,
	STRINGS: -8
}

function push(op) {
	stack.push(op);

	switch ( op ) {
	case d.STRINGS:
		strings = [];
		push(d.AMOUNT);
		break;
	case d.AMOUNT:
		amount = 0;
		push(d.UINT);
		break;
	case d.STRING:
		buffer = Buffer.alloc(0);
		push(d.LENGTH);
		break;
	case d.LENGTH:
		length = 0;
		push(d.UINT);
		break;
	case d.SINT:
		sInt = 0;
		push(d.UINT);
	case d.UINT:
		uInt = 0;
		break;
	}
}

function pop() {
	cont = true;
	return stack.pop();
}

function top() {
	return stack[stack.length - 1];
}

function handleUInt(feeder) {
	if ( feeder.isEmpty() )
		return true;

	let byte = feeder.get(1)[0];
	uInt = (uInt << 7 ) + (byte & 0x7f);

	return byte & 0x80;
}

function handleContent(feeder) {
	if ( length === 0 )
		return false;
	else if ( feeder.isEmpty() )
		return true;
	else
		buffer = Buffer.concat([buffer,feeder.get(length-buffer.length)]);

	return length !== buffer.length;
}

function handleData(feeder) {
	switch( top() ) {
	case d.UINT:	// a, loop.
		if ( !handleUInt(feeder) ) {
			pop();
			// console.log("uInt: ", uInt);
		}
		break;
	case d.SINT:
		sInt = uInt & 1 ? -( ( uInt >> 1 ) + 1 ) : uInt >> 1;
		pop();
		// console.log("sInt: ", sInt);
		break;
	case d.LENGTH:	// c.
		length = uInt;
		pop();
		push(d.CONTENT);
		// console.log("length: ", length);
		break;
	case d.CONTENT:	// d, loop.
		if ( !handleContent(feeder) )
			pop();
		break;
	case d.STRING:	// e.
		string = buffer.toString("utf-8");
		pop();
		break;
	case d.AMOUNT:
		pop();
		amount = uInt;
		push(d.STRING);
		break;
	case d.STRINGS:
		strings.push(string);
		// console.log("S:", amount, strings);

		if ( strings.length < amount)
			push(d.STRING);
		else
			pop();
		break;
	default:
		if ( top() < 0 )
			exit_("Unknown data operation");
		return false;
		break;
	}

	return true;
}

/*********/
/* SERVE */
/*********/

var instance = undefined;

const s = {
	SERVE: 300,
	COMMAND: 301,
	CREATION: 302,
	CLOSING: 303,
	ERROR: 304,
	LANGUAGE: 305,
	LAUNCH: 306,
	ID: 307,
	ACTION: 308,
	RESPONSE: 309,
}

// Special ids.
const ids = {
	FORBIDDEN: -1,
	CREATION: -2,
	CLOSING: -3
}

function handleCommand(command) {
	let IsCommand = true;

	// console.log(command);

	switch (command) {
	case ids.FORBIDDEN:
		exit_("Received unexpected undefined command id!");
		break;
	case ids.CREATION:
		push(s.CREATION);
		push(d.SINT);
		break;
	case ids.CLOSING:
		push(s.CLOSING);
		push(d.SINT);
		break;
	default:
		if (command < 0 )
			exit_("Unknown command of id '" + command + "'!");
		else
			IsCommand = false;
		break;
	}

	return IsCommand;
}

function fillXDH(xdh, id) {
	xdh.id = id;
	xdh.isFAAS = true;
	xdh.type = types.UNDEFINED;
	xdh.language = undefined;
	xdh.queued = [];
}

function report_(message) {
	socket.write(addString(addString(convertSInt(-1),"#Inform_1"), message));
}

function dismiss_(id) {
	socket.write(addString(convertSInt(id),"#Dismiss_1"));
}

function handleCreation(id, createCallback) {
	if (id in instances)
		report_("Instance of id  '" + id + "' exists but should not !");

	let instance = createCallback();

	instance._xdh = new Object;

	fillXDH(instance._xdh, id);

	instances[id] = instance;
}

function handleClosing(id) {
	if ( !(id in instances ) )
		report_("Instance of id '" + id + "' not available for destruction!");

	delete instances[id];	
}

function callCallback(callback, instance, id, action) {
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

function standBy(instance) {
	socket.write(addString(convertSInt(instance._xdh.id), "#StandBy_1"));
}

function handleLaunch(id, action, actionCallbacks) {
	if ( instance === undefined)
		exit_("No instance set!");

	if ( ( action === "" ) && isDev() )
		instance.debugLog();

	if ((action === "") || !("_PreProcess" in actionCallbacks) || callCallback(actionCallbacks["_Preprocess"], instance, id, action))
		if (callCallback(actionCallbacks[action], instance, id, action) && ("_PreProcess" in actionCallbacks))
			callCallback(actionCallbacks["_Postprocess"], instance, id, action);

	if (instance._xdh.queued.length === 0)
		standBy(instance);
}

function setResponse(type) {
	push(s.RESPONSE);

	switch( type ) {
	case types.STRING:
		push(d.STRING);
		break;
	case types.STRINGS:
		push(d.STRINGS);
		break;
	default:
		exit_("Bad response type!");
		break;
	}	
}

function serve(feeder, createCallback, actionCallbacks) {
	while ( !feeder.isEmpty() || cont ) {
		cont = false;

		// console.log(stack)
		
		switch (top()) {
		case s.SERVE:
			push(s.COMMAND);
			push(d.SINT);
			break;
		case s.COMMAND:
			pop();
			if ( !handleCommand(sInt) ) {	// Makes the required 'push(…)'.
				let id = sInt;

				if ( !(id in instances) ) {
					report_("Unknown instance of id '" + id + "'!");
					dismiss_(id);
				} else {
					instance = instances[id];

					if (instance._xdh.language === undefined) {
						push(s.LANGUAGE);
						push(d.STRING);
					} else if ( instance._xdh.queued.length === 0) {
						push(s.LAUNCH);
						push(s.ID);
						push(d.STRING);
					} else {
						setResponse(instance._xdh.queued[0].type);
					}
				}
			}
			break;
		case s.CREATION:
			pop();
			handleCreation(sInt, createCallback);
			break;
		case s.CLOSING:
			pop();
			handleClosing(sInt);
			break;
		case s.ERROR:
			if ( string !== "" )
				exit_(string);
			
			pop();
			push(s.LANGUAGE);
			push(d.STRING);
			break;
		case s.LANGUAGE:
			instance._xdh.language = string;
			pop();
			break;
		case s.LAUNCH:
			pop();
			// console.log(">>>>> Action:", string, id);
			handleLaunch(id, string, actionCallbacks);
			break;
		case s.ID:
			pop();
			id = string;
			push(s.ACTION);
			push(d.STRING);
			break;
		case s.ACTION:
			pop();
			cont = true;
			break;
		case s.RESPONSE:
			pop();

			let pending = instance._xdh.queued.shift();
			let type = pending.type;
			let callback = pending.callback;

			if ( callback !== undefined) {
				switch ( type ) {
				case types.UNDEFINED:
					exit_("Undefined type not allowed here!");
					break;
				case types.VOID:
					callback();
					break;
				case types.STRING:
					callback(string);
					break;
				case types.STRINGS:
					// console.log("Strings: ", strings);
					callback(strings);
					break;
				default:
					exit_("Unknown type of value '" + type + "'!");
					break;
				}

				if (instance._xdh.queued.length === 0)
					standBy(instance);
			} else
				standBy(instance);
			break;
		default:
			if ( !handleData(feeder) )
				exit_("Unknown serve operation!");
			break;
		}
	}
}

/************/
/* IGNITION */
/************/

const i = {
	IGNITION: 201,
	TOKEN: 202,
	ERROR: 203,
	URL: 204
}

function handleURL(url) {
	console.log(url);
	console.log(new Array(url.length + 1).join('^'));
	console.log("Open above URL in a web browser (click, right click or copy/paste). Enjoy!\n");

	let ATK = getEnv("ATK").toUpperCase();

	if (ATK === "REPLIT") {
		REPLit(url);
	} else if ( ATK !== "NONE" )
		open(url);	
}

function ignition(feeder) {
	while ( !feeder.isEmpty() || cont ) {
		cont = false;
		switch( top() ) {
		case i.IGNITION:
			pop();
			push(s.SERVE);
			return false;
			break;
		case i.TOKEN:
			token = string;

			pop();

			if ( isTokenEmpty() )
				push(i.ERROR);
			else {
				push(i.URL);
				push(d.STRING);
			}
			break;
		case i.ERROR:
			exit_(string);
			break;
		case i.URL:
			pop();
			handleURL(string);
			break;
		default:
			if ( !handleData(feeder) )
				exit_("Unknown ignition operation!");
			break;
		}
	}

	return true;
}

/*************/
/* HANDSHAKE */
/*************/

const h = {
	HANDSHAKES: 101,
	ERROR_FAAS: 102,
	NOTIFICATION_FAAS: 103,
	ERROR_MAIN: 104,
	NOTIFICATION_MAIN: 105,
}

function handshakes(feeder, head) {
	while ( !feeder.isEmpty() || cont ) {
		cont = false;
		switch( top() ) {
		case h.HANDSHAKES:
			pop();
			socket.write(addString(addString(addString(handleString(token), head === undefined ? "" : head),wAddr),""));
			push(i.IGNITION);
			push(i.TOKEN);
			push(d.STRING);
			return false;
			break;
		case h.ERROR_FAAS:
			if ( string.length )
				exit_(string);

			pop();
			push(h.NOTIFICATION_FAAS);
			push(d.STRING);
			break;
		case h.NOTIFICATION_FAAS:
			if ( string.length )
				console.log(string);

			socket.write(addString(addString(handleString(mainProtocolLabel),mainProtocolVersion),scriptVersion));
			pop();
			push(h.ERROR_MAIN);
			push(d.STRING);
			break;
		case h.ERROR_MAIN:
				if ( string.length )
					exit_(string);

				pop();
				push(h.NOTIFICATION_MAIN);
				push(d.STRING);
				break;
		case h.NOTIFICATION_MAIN:
			if ( string.length )
				console.log(string);

			pop();
			break;
		default:
			if ( !handleData(feeder) )
				exit_("Unknown handshake operation!");
			break;
		}
	}

	return true;
}

const p = {
	HANDSHAKES: 1,
	IGNITION: 2,
	SERVE: 3,
}

var phase = p.HANDSHAKES;

function onRead(data, createCallback, actionCallbacks, head) {

	// console.log(">>>>> DATA:", data.length);

	let feeder = new Feeder(data);

	while ( !feeder.isEmpty() ) {
		switch ( phase ) {
		case p.HANDSHAKES:
			if ( !handshakes(feeder, head) )
				phase = p.IGNITION;
			break;
		case p.IGNITION:
			if ( !ignition(feeder) )
				phase = p.SERVE;
			break;
		case p.SERVE:
			serve(feeder, createCallback, actionCallbacks);
			break;
		default:
			exit_("Unknown phase of value '" + step + "'!");
			break;
		}
	}
}

function launch(createCallback, actionCallbacks, head) {
	socket = new net.Socket();

	socket.on('error', (err) => {
		console.log("Unable to connect to '" + pAddr + ":" + pPort + "' !!!");
		process.exit(-1);
	});

	console.log("Connecting to '" + pAddr + ":" + pPort + "'…");

	socket.connect(pPort, pAddr, () => {
		console.log("Connected to '" + pAddr + ":" + pPort + "'.")
		push(h.HANDSHAKES);
		push(h.ERROR_FAAS);
		push(d.STRING);
		socket.on('data', (data) => onRead(data, createCallback, actionCallbacks, head));
		
		socket.write(addString(addString(handleString(faasProtocolLabel),faasProtocolVersion),"NJS"));
	});	
}

function addTagged(data, argument) {
	if (typeof argument === "string") {
		return addString(Buffer.concat([data,convertUInt(types.STRING)]), argument);
    } else if (typeof argument === "object") {
		return addStrings(Buffer.concat([data,convertUInt(types.STRINGS)]), argument);
    } else
		exit_("Unexpected argument type: " + typeof argument);
}

function call(instance, command, type) {
	// console.log(">>>>> Call command:", instance._xdh.id, command);

	let i = 3;
	let data = convertSInt(instance._xdh.id);
	let amount = arguments.length-1;
    
    data = Buffer.concat([addString(data,command),convertUInt(type)])

//	console.log( Date.now(), " Command: ", command, instance._xdh.id);

	while (i < amount)
		data = addTagged(data, arguments[i++]);
    
	data = Buffer.concat([data, convertUInt(types.VOID)]) // To report end of argument list.

	socket.write(data);

	let callback = arguments[i++]
	
	if ( type === types.VOID) {
		if ( callback !== undefined )
			callback();
	} else if ( type !== types.UNDEFINED ) {
		let pending = new Object();

		pending.type = type;
		pending.callback = callback;

		instance._xdh.queued.push(pending);
	} else
		exit_("'UNDEFINED' type not allowed here!");
}

function broadcastAction(action, id) {
	if ( ( action === undefined ) || ( action === "" ) )
		exit_("There must be an non-empty action parameter for tha broadcastAction function!");

	socket.write(addString(addString(convertSInt(-3), action), id === undefined ? "" : id ));
}

module.exports.launch = launch;
module.exports.call = call;
module.exports.broadcastAction = broadcastAction;

