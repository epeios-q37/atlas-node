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
	xml.putAttribute("xdh:onevent", "Swap");
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

function swap(dom, source, id) {
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
	dom.inner("", body);
	scramble(dom);
}

function acSwap(dom, id) {
	testAndSwap(dom, id);
}

function newSession() {
	return new Puzzle();
}

function main() {
	const callbacks = {
		"": acConnect,
		"Swap": acSwap,
		"Scramble": (dom, id) => scramble(dom)
	};

	atlas.launch(newSession, callbacks, head);
}

const head = `
<title>15-puzzle with the Atlas toolkit Atlas</title>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUEAvyEhsxERuS8urQsKuycnsRkYtzc2qwUFvRUVtysrrx0ctTs6qTMyrSUksQ0NuyciPBdAAABHklEQVR42mNgwAa8zlxjDd2A4POfOXPmzZkFCAH2M8fNzyALzDlzg2ENssCbMwkMOsgCa858YOjBKxBzRoHhD7LAHiBH5swCT9HQ6A9ggZ4zp7YCrV0DdM6pBpAAG5Blc2aBDZA68wCsZPuZU0BDH07xvHOmAGKKvgMP2NA/Zw7ADIYJXGDgLQeBBSCBFu0aoAPYQUadMQAJAE29zwAVWMCWpgB08ZnDQGsbGhpsgCqBQHNfzRkDEIPlzFmo0T5nzoMovjPHoAK8Zw5BnA5yDosDSAVYQOYMKIDZzkoDzagAsjhqzjRAfXTmzAQgi/vMQZA6pjtAvhEk0E+ATWRRm6YBZuScCUCNN5szH1D4TGdOoSrggtiNAH3vBBjwAQCglIrSZkf1MQAAAABJRU5ErkJggg==" />
<style>
  .hidden {
    display: none;
  }

  .scramble {
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #3d94f6), color-stop(1, #1e62d0));
    background:-moz-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);
    background:-webkit-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);
    background:-o-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);
    background:-ms-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);
    background:linear-gradient(to bottom, #3d94f6 5%, #1e62d0 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#3d94f6', endColorstr='#1e62d0',GradientType=0);
    background-color:#3d94f6;
    -moz-border-radius:29px;
    -webkit-border-radius:29px;
    border-radius:29px;
    display:inline-block;
    cursor:pointer;
    color:#ffffff;
    font-family:Arial;
    font-size:50px;
    font-weight:bold;
    padding:6px 24px;
    text-decoration:none;
  }
  .scramble:hover {
    background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #1e62d0), color-stop(1, #3d94f6));
    background:-moz-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);
    background:-webkit-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);
    background:-o-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);
    background:-ms-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);
    background:linear-gradient(to bottom, #1e62d0 5%, #3d94f6 100%);
    filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#1e62d0', endColorstr='#3d94f6',GradientType=0);
    background-color:#1e62d0;
  }
  .scramble:active {
    position:relative;
    top:1px;
  }

</style>
`;

const body = `
<div style="display: table; margin: 50px auto auto auto;">
<div  style="display: flex; flex-direction: column;">
  <!-- Following SVG was derived from:�15-puzzle.svg:, Public Domain, https://commons.wikimedia.org/w/index.php?curid=28995093 -->
  <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="460px" height="460px" viewBox="0,0, 460,460" id="svg2"><style xmlns="" type="text/css" id="block-image-video"/>
    <defs>
      <linearGradient id="lgg">
        <stop style="stop-color :#DFE5ED;" offset="0"/>
        <stop style="stop-color :#A5B1C1;" offset="1"/>
      </linearGradient>
      <linearGradient id="lg1" xlink:href="#lgg" gradientUnits="userSpaceOnUse" x1="127" y1="59" x2="92" y2="139"/>
      <symbol id="stone" style=" fill-rule :nonzero; stroke :#000000; stroke-linejoin :round; stroke-width :2;">
        <polygon points="95,1 107,14 107,107 95,95" style="fill :#A9B9CF;"/>
        <polygon points="1,95 95,95 107,107 14,107" style="fill :#90A5C1;"/>
        <rect x="1" y="1" width="94" height="94" style="fill :url(#lg1);"/>
      </symbol>
    </defs>
    <g style="fill-rule :evenodd; stroke-linejoin :round; stroke :#000000; stroke-width :2;">
      <polygon id="backwood" points="10,10  10,430 430,430 430,10" style="fill :#E3B074;"/>
      <polygon id="topinner" points="10,10 430,10  430,40   10,40" style="fill :#B27125;"/>
      <polygon id="leftinner" points="10,10  40,40   40,430  10,430" style="fill :#DDA15B;"/>
    </g>
    <g id="Stones"/>
    <g style="fill-rule :evenodd; stroke-linejoin :round; stroke-linecap :butt; stroke :#000000; stroke-width :2;">
      <polygon id="rightoutside" style="fill :#DDA15B;" points="430,10 450,30  450,450 430,430"/>
      <polygon id="bottomoutside" style="fill :#B27125;" points="10,430 430,430 450,450  30,450"/>
      <path id="boxtopside" style="fill :#E8BF8F;" d="M 10,10 L 430,10 L 430,430 L 10,430 z M 20,20 L 20,420 L 420,420 L 420,20 z"/>
    </g>
    <g id="Texts" xml:space="preserve" style="font-size :50px; text-anchor :middle; fill :#000000; stroke :none; font-family :Arial, sans-serif; font-weight :bold;pointer-events: none;"/>
  </svg>
  <div style="display: table; margin: auto;">
  <a xdh:onevent="Scramble" class="scramble">Scramble</a>
  </div>
  </div>
</div>
`;

main();
