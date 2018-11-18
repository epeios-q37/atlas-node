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

const DOM = atlas.DOM;
const readAsset = atlas.readAsset;

var pseudos = [];
var messages = [];

var messageBlockId;

class MyData extends DOM {
	constructor() {
		super();
		this.timestamp = new Date();
		this.pseudo = "";
		this.lastMessage = 0;
	}
}

function displayMessages(dom) {
	var xml = atlas.createXML('XDHTML');
	var i = messages.length - 1;
	var message;

	if (i >= dom.lastMessage) {
		xml.pushTag("Messages");
		xml.setAttribute( 'pseudo', dom.pseudo );

		while (i >= dom.lastMessage) {
			message = messages[i];
			xml.pushTag('Message');
			xml.setAttribute( 'id', i );
			xml.setAttribute( 'pseudo', message["pseudo"] );
			xml.setValue(message["content"]);
			xml.popTag();
			i--;
		}

		dom.lastMessage = messages.length;

		xml.popTag();

		dom.createElement("span",
			(id) => dom.setLayoutXSL(id, xml, "Messages.xsl",
				() => dom.insertChild(id, "Board")
			)
		);
	}
}

function newSession() {
	return new MyData();
}

function acConnect(dom, id) {
	dom.setLayout("", readAsset("Main.html"),
		() => dom.focus("Pseudo",
			() => dom.setTimeout(1000, "Update",
				() => displayMessages(dom)
			)
		)
	);
}

function handlePseudo( pseudo ) 
{
	if (pseudos.includes(pseudo))
		return false;
	else {
		pseudos.push(pseudo);
		return true;
	}
}

function acSubmitPseudo(dom, id) {
	dom.getContent("Pseudo",
		(result) => {
			result = result.trim();

			if (result.length == 0) {
				dom.alert("Cannot be empty!",
					() => dom.setContent("Pseudo", "",
						() => dom.focus( "Pseudo" )
					)
				);
			} else if (handlePseudo(result.toUpperCase())) {
				dom.pseudo = result;
				dom.addClass("PseudoButton", "hidden");
				dom.disableElements(["Pseudo", "PseudoButton"]);
				dom.enableElements(["Message", "MessageButton"]);
				dom.setContent("Pseudo", result);
				dom.focus("Message");
				console.log("\t>>>> New user: " + result);
			} else {
				dom.alert("Already used!",
					() => dom.setContent("Pseudo", result,
						() => dom.focus( "Pseudo" )
					)
				);
			}
		}
	);
}

function acSubmitMessage(dom, id) {
	dom.getContent("Message",
		(result) => {
			dom.setContent("Message", "",
				() => dom.focus("Message",
					() => {
						result = result.trim();
						if (result.length != 0) {
							console.log("'" + dom.pseudo + "' : " + result);
							messages.push({
								"pseudo": dom.pseudo,
								"content": result
							});
							displayMessages(dom);
						}
					}
				)
			)
		}
	);
}

function acUpdate(dom, id) {
	dom.setTimeout(1000, "Update",
		() => displayMessages(dom)
	);
}

function main() {
	const callbacks = (
		{
			"Connect": acConnect,
			"SubmitPseudo": acSubmitPseudo,
			"SubmitMessage": acSubmitMessage,
			"Update": acUpdate,
		}
	);

	atlas.launch(newSession, "Connect", callbacks, readAsset( "Head.html") );
}

main();
