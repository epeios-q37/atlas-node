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

class Blank extends DOM {
	constructor() {
		super();
		this.timestamp = new Date();
	}
}

function newSession() {
	return new Blank();
}

function acConnect(dom, id) {
	dom.inner("", body);
}

function acSubmit(dom, id) {
	dom.getValue("Pattern",
		(result) => dom.setValue("Pattern", result.toUpperCase())
	);
}

function acHideInput(dom, id) {
	dom.addClass("Input", "hidden");
}

function acShowInput(dom, id) {
	dom.removeClass("Input", "hidden");
	dom.focus("Pattern");
}

function main() {
    const callbacks = {
		"": acConnect,
		"Submit": acSubmit,
		"HideInput": acHideInput,
		"ShowInput": acShowInput
    };

	atlas.launch(newSession, callbacks, head );
}

// Content of 'Head.html'.
const head = `
<title>(almost) blank example</title>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUEAvyEhsxERuS8urQsKuycnsRkYtzc2qwUFvRUVtysrrx0ctTs6qTMyrSUksQ0NuyciPBdAAABHklEQVR42mNgwAa8zlxjDd2A4POfOXPmzZkFCAH2M8fNzyALzDlzg2ENssCbMwkMOsgCa858YOjBKxBzRoHhD7LAHiBH5swCT9HQ6A9ggZ4zp7YCrV0DdM6pBpAAG5Blc2aBDZA68wCsZPuZU0BDH07xvHOmAGKKvgMP2NA/Zw7ADIYJXGDgLQeBBSCBFu0aoAPYQUadMQAJAE29zwAVWMCWpgB08ZnDQGsbGhpsgCqBQHNfzRkDEIPlzFmo0T5nzoMovjPHoAK8Zw5BnA5yDosDSAVYQOYMKIDZzkoDzagAsjhqzjRAfXTmzAQgi/vMQZA6pjtAvhEk0E+ATWRRm6YBZuScCUCNN5szH1D4TGdOoSrggtiNAH3vBBjwAQCglIrSZkf1MQAAAABJRU5ErkJggg==" />
<style type="text/css">
 html, body {height: 100%; padding: 0; margin: 0;}
 .vcenter-out, .hcenter {display: table; height: 100%; margin: auto;}
 .vcenter-in {display: table-cell; vertical-align: middle;}
 .hidden {display: none;}
</style>
`;

// Content of 'Main.html'.
const body = `
<div class="vcenter-out">
	<div class="vcenter-in">
		<span xdh:onevent="mouseleave|HideInput">
			<fieldset>
				<div xdh:onevent="ShowInput">
					<text>Clicking on this text shows an input field, leaving this frame hides it.</text>
				</div>
				<div id="Input" class="hidden">
					<input id="Pattern" type="text" size="50" xdh:onevent="Submit" placeholder="Text to convert to upper case"/>
					<button title="Converts to upper case" xdh:onevent="Submit">Convert</button>
				</div>
			</fieldset>
		</span>
	</div>
</div>
`;

main();
