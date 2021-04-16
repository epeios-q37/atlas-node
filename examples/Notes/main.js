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

const viewModeElements = ["Pattern", "CreateButton", "DescriptionToggling", "ViewNotes"];

class Notes extends DOM {
	constructor() {
		super();
		this.timestamp = new Date();
		this.pattern = "";
		this.hideDescriptions = false;
		this.id = 0;
		this.notes = [
			// First one must be empty; it is used as buffer for new entries.
			{
				title: '',
				description: ''
			}, {
				title: 'Improve design',
				description: "Tastes and colors… (aka «CSS aren't my cup of tea…»)"
			}, {
				title: 'Fixing bugs',
				description: 'There are bugs ? Really ?'
			}, {
				title: 'Implement new functionalities',
				description: "Although it's almost perfect…, isn't it ?"
			}
		];
	}
}

function newSession() {
	return new Notes();
}

function push(note, id, xml) {
	xml.pushTag('Note');
	xml.putAttribute('id', id);
	for (var prop in note) {
		xml.putTagAndValue(prop, note[prop]);
	}

	xml.popTag();

	return xml;
}

function handleDescriptions(dom) {
	if (dom.hideDescriptions)
		dom.disableElement("ViewDescriptions");
	else
		dom.enableElement("ViewDescriptions");
}

function displayList(dom) {
	var xml = atlas.createXML('XDHTML');
	var i = 1;	// 0 skipped, as it serves as buffer for the new ones.
	var contents = {};

	xml.pushTag("Notes");

	while (i < dom.notes.length) {
		if (dom.notes[i]['title'].toLowerCase().startsWith(dom.pattern)) {

			xml = push(dom.notes[i], i, xml);
			contents["Description." + i] = dom.notes[i]['description'];
		}
		i++;
	}

	xml.popTag();

	dom.inner("Notes", xml, "Notes.xsl",
		() => dom.setValues(contents,
			() => dom.enableElements(viewModeElements,
				() => handleDescriptions(dom)
			)
		)
	);
}

function acConnect(dom, id) {
	dom.inner("", readAsset( "Main.html" ),
		() => displayList(dom)
	);
}

function acSearch(dom, id) {
	dom.getValue("Pattern",
		(result) => {
			dom.pattern = result.toLowerCase();
			displayList(dom);
		}
	);
}

function acToggleDescriptions(dom, id) {
	dom.getValue(id,
		(result) => {
			dom.hideDescriptions = result === "true";
			handleDescriptions(dom);
		}
	);
}

function view(dom) {
	dom.enableElements(
		viewModeElements,
		() => {
			dom.setValue("Edit." + dom.id, "");
			dom.id = -1;
		}
	);
}

function edit(dom, id) {
	dom.id = parseInt(id);
	dom.inner("Edit." + id, readAsset( "Note.html" ),
		() => dom.setValues(
			{
				"Title": dom.notes[dom.id]['title'],
				"Description": dom.notes[dom.id]['description']
			},
			() => dom.disableElements(
				viewModeElements,
				() => dom.focus("Title")
				)
			)
	);
}

function acEdit(dom, id) {
	dom.getMark(id,
		(result) => edit(dom, result)
	);
}

function acDelete(dom, id) {
	dom.confirm("Are you sure you want to delete this entry ?",
		(response) => {
			if (response) dom.getMark(id,
				(result) => {
					dom.notes.splice(parseInt(result), 1);
					displayList(dom);
				}
			);
		}
	);
}

function acSubmit(dom, id) {
	dom.getValues(["Title", "Description"],
		(result) => {
			var title = result['Title'].trim();
			var description = result['Description'];

			if (title !== '') {
				dom.notes[dom.id]['title'] = title;
				dom.notes[dom.id]['description'] = description;
				if (dom.id === 0) {
					dom.notes.unshift({ title: '', description: '' });
					displayList(dom);
				} else {
					let contents = {};
					contents["Title." + dom.id] = title;
					contents["Description." + dom.id] = description;
					dom.setValues(contents,
						() => view(dom)
					);
				}
			} else
				dom.alert("Title can not be empty !",
					() => dom.focus("Title") );
		}
	);
}

function acCancel(dom, id) {
	dom.getValues(["Title", "Description"],
		(result) => {
			if (dom.notes[dom.id]['title'] !== result['Title'] || dom.notes[dom.id]['description'] !== result['Description'])
				dom.confirm("Are you sure you want to cancel your modifications ?",
					(response) => {
						if (response === true) view(dom);
					}
				);
			else
				view(dom);
		}
	);
}

function main() {
	const callbacks = {
		"": acConnect,
		"ToggleDescriptions": acToggleDescriptions,
		"Search": acSearch,
		"Edit": acEdit,
		"Delete": acDelete,
		"Submit": acSubmit,
		"Cancel": acCancel
	};

	atlas.launch(newSession, callbacks, readAsset("Head.html"));
}

main();