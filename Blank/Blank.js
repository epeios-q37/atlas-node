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
	along with XDHq If not, see <http://www.gnu.org/licenses/>.
*/

var atlas;

if (process.env.EPEIOS_SRC) {
	let epeiosPath = "";

	if (process.platform == 'win32')
		epeiosPath = "h:/hg/epeios/"
	else
		epeiosPath = "~/hg/epeios/"

	atlas = require(epeiosPath + "tools/xdhq/Atlas/NJS/Atlas.js");
} else {
	atlas = require('atlastk');
}

const fs = require('fs');
const DOM = atlas.DOM;

const readAsset = atlas.readAsset;

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
	dom.setLayout("", body);
}

function acSubmit(dom, id) {
	dom.getContent("Pattern",
		(result) => dom.setContent("Pattern", result.toUpperCase())
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
	const callbacks = (
		{
			"Connect": acConnect,
			"Submit": acSubmit,
			"HideInput": acHideInput,
			"ShowInput": acShowInput,
		}
	);

	atlas.launch(newSession, "Connect", callbacks, head );
}

// Content of 'Head.html'.
const head = `
<title>(almost) blank example</title>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUEAvyEhsxERuS8urQsKuycnsRkYtzc2qwUFvRUVtysrrx0ctTs6qTMyrSUksQ0NuyciPBdAAABHklEQVR42mNgwAa8zlxjDd2A4POfOXPmzZkFCAH2M8fNzyALzDlzg2ENssCbMwkMOsgCa858YOjBKxBzRoHhD7LAHiBH5swCT9HQ6A9ggZ4zp7YCrV0DdM6pBpAAG5Blc2aBDZA68wCsZPuZU0BDH07xvHOmAGKKvgMP2NA/Zw7ADIYJXGDgLQeBBSCBFu0aoAPYQUadMQAJAE29zwAVWMCWpgB08ZnDQGsbGhpsgCqBQHNfzRkDEIPlzFmo0T5nzoMovjPHoAK8Zw5BnA5yDosDSAVYQOYMKIDZzkoDzagAsjhqzjRAfXTmzAQgi/vMQZA6pjtAvhEk0E+ATWRRm6YBZuScCUCNN5szH1D4TGdOoSrggtiNAH3vBBjwAQCglIrSZkf1MQAAAABJRU5ErkJggg==" />
<style type="text/css">
 html,
 body {
	height: 100%;
	padding: 0;
	margin: 0;
}

 .vcenter-out,
 .hcenter {
	display: table;
	height: 100%;
	margin: auto;
}

 .vcenter-in {
	display: table-cell;
  vertical-align: middle;
}

 .hidden {
	display: none;
}
</style>
`;

// Content of 'Main.html'.
const body = `
<div class="vcenter-out">
	<div class="vcenter-in">
		<span data-xdh-onevent="mouseleave|HideInput">
			<fieldset>
				<div data-xdh-onevent="ShowInput">
					<text>Clicking on this text shows an input field, leaving this frame hides it.</text>
				</div>
				<div id="Input" class="hidden">
					<input id="Pattern" type="text" size="50" data-xdh-onevent="Submit" placeholder="Text to convert to upper case"/>
					<button title="Converts to upper case" data-xdh-onevent="Submit">Convert</button>
				</div>
			</fieldset>
		</span>
	</div>
</div>
`;

main();
