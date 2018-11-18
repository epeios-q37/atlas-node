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
		xml.setAttribute('pseudo', dom.pseudo);

		while (i >= dom.lastMessage) {
			message = messages[i];
			xml.pushTag('Message');
			xml.setAttribute('id', i);
			xml.setAttribute('pseudo', message["pseudo"]);
			xml.setValue(message["content"]);
			xml.popTag();
			i--;
		}

		dom.lastMessage = messages.length;

		xml.popTag();

		dom.createElement("span",
			(id) => dom.setLayoutXSL(id, xml, xsl,
				() => dom.insertChild(id, "Board")
			)
		);
	}
}

function newSession() {
	return new MyData();
}

function acConnect(dom, id) {
	dom.setLayout("", body,
		() => dom.focus("Pseudo",
			() => dom.setTimeout(1000, "Update",
				() => displayMessages(dom)
			)
		)
	);
}

function handlePseudo(pseudo) {
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
						() => dom.focus("Pseudo")
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
						() => dom.focus("Pseudo")
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

	atlas.launch(newSession, "Connect", callbacks, head);

}

const head = `
<title>Chat room</title>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUEAvyEhsxERuS8urQsKuycnsRkYtzc2qwUFvRUVtysrrx0ctTs6qTMyrSUksQ0NuyciPBdAAABHklEQVR42mNgwAa8zlxjDd2A4POfOXPmzZkFCAH2M8fNzyALzDlzg2ENssCbMwkMOsgCa858YOjBKxBzRoHhD7LAHiBH5swCT9HQ6A9ggZ4zp7YCrV0DdM6pBpAAG5Blc2aBDZA68wCsZPuZU0BDH07xvHOmAGKKvgMP2NA/Zw7ADIYJXGDgLQeBBSCBFu0aoAPYQUadMQAJAE29zwAVWMCWpgB08ZnDQGsbGhpsgCqBQHNfzRkDEIPlzFmo0T5nzoMovjPHoAK8Zw5BnA5yDosDSAVYQOYMKIDZzkoDzagAsjhqzjRAfXTmzAQgi/vMQZA6pjtAvhEk0E+ATWRRm6YBZuScCUCNN5szH1D4TGdOoSrggtiNAH3vBBjwAQCglIrSZkf1MQAAAABJRU5ErkJggg==" />
<style type="text/css">
	.hcenter {
		display: table;
		height: 100%;
		margin: auto;
	}

	.hidden {
		display: none;
	}

	.self {
		color: red;
		font-weight: bold;
	}

	.other {
		font-style: oblique;
	}
</style>
`;

const body = `
<div class="hcenter">
	<div style="display: flex; flex-direction: column;">
		<fieldset>
			<legend>Pseudo.</legend>
			<input id="Pseudo" type="text" size="10" maxlength="10" data-xdh-onevent="SubmitPseudo" placeholder="Pseudonyme" />
			<button title="Choose a pseudonym." data-xdh-onevent="SubmitPseudo" id="PseudoButton">Send</button>
		</fieldset>
		<fieldset style="display: flex; flex-direction: column;">
			<legend>Message</legend>
			<textarea rows="3" cols="20" id="Message" type="text" maxlength="150" data-xdh-onevent="SubmitMessage" placeholder="Message to send" disabled="disabled"></textarea>
			<button title="Send a message." data-xdh-onevent="SubmitMessage" disabled="disabled" id="MessageButton">Send</button>
		</fieldset>
		<fieldset>
			<legend>Board</legend>
			<div id="Board" class="hcenter" style="width: 90%;"/>
		</fieldset>
	</div>
</div>
`;

// Note to developer:
// DON'T PASTE TO Visual Studio : it inserts extraneous characters !
// There must be NO characters before the XML declaration !
const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="UTF-8"/>
	<xsl:template match="/XDHTML">
		<xsl:apply-templates select="Messages"/>
	</xsl:template>
	<xsl:template match="Messages">
		<xsl:apply-templates select="Message"/>
	</xsl:template>
	<xsl:template match="Message">
		<li id="Message.{@id}" data-xdh-value="{@id}">
			<xsl:element name="span">
				<xsl:attribute name="class">
					<xsl:choose>
						<xsl:when test="@pseudo=../@pseudo">
							<xsl:text>self</xsl:text>
						</xsl:when>
						<xsl:otherwise>
							<xsl:text>other</xsl:text>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:attribute>
				<xsl:value-of select="@pseudo"/>
			</xsl:element>
			<xsl:text> : </xsl:text>
			<xsl:value-of select="."/>
		</li>
	</xsl:template>
</xsl:stylesheet>
`;

main();
