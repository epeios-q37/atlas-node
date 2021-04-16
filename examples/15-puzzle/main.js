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

"use strict";

var atlas;

if (process.env.Q37_EPEIOS) {
	let epeiosPath = "";

	if (process.platform === 'win32')
		epeiosPath = "h:/hg/epeios/";
	else
		epeiosPath = process.env.Q37_EPEIOS;

	atlas = require(epeiosPath + "tools/xdhq/Atlas/NJS/Atlas.js");
} else {
	atlas = require('atlastk');
}

const DOM = atlas.DOM;

const readAsset = atlas.readAsset;

class Puzzle extends DOM {
}

function fill(dom) {
	let numbers = [];
	let contents = [];

	for (let i = 0; i < 16; i++)
		numbers.push(i);

	for (let i = 0; i < 16; i++) {
		let number = numbers.splice(Math.floor(Math.random() * numbers.length), 1)[0];

		if (number !== 0)
			contents["t" + i] = number;
		else
			dom.blank = i;
	}

	dom.setValues(contents);
	dom.toggleClass(dom.blank, "hidden");
}

function convertX(pos) {
	return pos % 4;
}

function convertY(pos) {
	return pos >> 2;  // pos / 4
}

function drawSquare(xml, x, y) {
	xml.pushTag("use");
	xml.putAttribute("id", y * 4 + x);
	xml.putAttribute("data-xdh-onevent", "Swap");
	xml.putAttribute("x", x * 100 + 24);
	xml.putAttribute("y", y * 100 + 24);
	xml.putAttribute("xlink:href", "#stone");
	xml.popTag();

	return xml;
}

function drawGrid(dom) {
	let xml = atlas.createXML("g");

	for (let x = 0; x < 4; x++)
		for (let y = 0; y < 4; y++)
			xml = drawSquare(xml, x, y);

	dom.inner("Stones", xml);
}

function setText(xml, x, y) {
	xml.pushTag("tspan");
	xml.putAttribute("id", "t" + (y * 4 + x));
	xml.putAttribute("x", x * 100 + 72);
	xml.putAttribute("y", y * 100 + 90);
	xml.popTag();

	return xml;
}

function setTexts(dom) {
	let xml = atlas.createXML("text");

	for (let x = 0; x < 4; x++)
		for (let y = 0; y < 4; y++)
			xml = setText(xml, x, y);

	dom.inner("Texts", xml);
}

function swap(dom, source,id) {
	dom.getValue(
		"t" + source,
		(value) => dom.setValues({
				["t" + dom.blank]: value,
				["t" + source]: ""
			},
			() => dom.toggleClasses({
				[dom.blank]: "hidden",
				[source]: "hidden"
				},
				() => {
					dom.blank = source;
					testAndSwap(dom, id);
				})));
}

function testAndSwap(dom, id) {
	let ix = convertX(parseInt(id));
	let iy = convertY(parseInt(id));
	let bx = convertX(dom.blank);
	let by = convertY(dom.blank);

	if (ix === bx) {
		if (by < iy)
			swap(dom, dom.blank + 4, id);
		else if (by > iy)
			swap(dom, dom.blank - 4, id);
	} else if (iy === by) {
		if (bx < ix)
			swap(dom, dom.blank + 1, id);
		else if (bx > ix)
			swap(dom, dom.blank - 1, id);
	}
}

function scramble(dom) {
	drawGrid(dom);
	setTexts(dom);
	fill(dom);
}

function acConnect(dom, id) {
	dom.inner("", readAsset("Main.html"));
	scramble(dom);
}

function acSwap(dom, id)
{
	testAndSwap(dom, id);
}

function newSession() {
	return new Puzzle();
}

function main() {
	const callbacks = {
		"": acConnect,
		"Swap": acSwap,
		"Scramble": (dom,id) => scramble(dom)
	};

	atlas.launch(newSession, callbacks, readAsset("Head.html"));
}

main();
