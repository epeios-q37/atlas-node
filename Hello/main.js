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

"use strict"

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

const callbacks = {
	"Connect": (dom, id) => dom.setLayout("", atlas.readAsset("Main.html"),
		() => dom.focus("input")),
	"Typing": (dom, id) => dom.getContent(id,
		(name) => dom.setContent("name", name)),
	"Clear": (dom, id) => dom.confirm("Are you sure ?",
		(answer) => { if (answer) dom.setContents({ "input": "", "name": "" }) }),
};

atlas.launch(() => new atlas.DOM(), "Connect", callbacks, atlas.readAsset('Head.html'));