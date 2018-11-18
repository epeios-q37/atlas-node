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

/*
	This is the one-file version, in which the content of
	the 'Head.html' and the 'Main.html' files are embedded.
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

// Content of 'Head.html'.
const head = `
<title>"Hello, World !" example</title>
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
</style>
`;

// Content of 'Main.html'.
const body = `
<div class ="vcenter-out">
 <div class ="vcenter-in">
  <fieldset>
   <label>Name: </label>
   <input id="input" maxlength="20" placeholder="Enter a name here" type="text" data-xdh-onevent="input|Typing" />
   <button data-xdh-onevent="Clear">Clear</button>
   <hr />
   <h1>
    <span>Hello </span>
    <span style="font-style: italic;" id="name"></span>
    <span>!</span>
   </h1>
  </fieldset>
 </div>
</div>
`;

const callbacks = {
	"Connect": (dom, id) => dom.setLayout("", body,
		() => dom.focus("input")),
	"Typing": (dom, id) => dom.getContent(id,
		(name) => dom.setContent("name", name)),
	"Clear": (dom, id) => dom.confirm("Are you sure ?",
		(answer) => { if (answer) dom.setContents({ "input": "", "name": "" }) }),
};

atlas.launch(() => new atlas.DOM(), "Connect", callbacks, head);
