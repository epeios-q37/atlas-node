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
		xml.putAttribute('pseudo', dom.pseudo);

		while (i >= dom.lastMessage) {
			message = messages[i];
			xml.pushTag('Message');
			xml.putAttribute('id', i);
			xml.putAttribute('pseudo', message["pseudo"]);
			xml.putValue(message["content"]);
			xml.popTag();
			i--;
		}

		dom.lastMessage = messages.length;

		xml.popTag();

		dom.begin("Board", xml, "Messages.xsl");
	}
}

function newSession() {
	return new MyData();
}

function acConnect(dom, id) {
	dom.inner("", body,
		() => dom.focus("Pseudo",
			() => displayMessages(dom)
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
	dom.getValue("Pseudo",
		(result) => {
			result = result.trim();

			if (result.length === 0) {
				dom.alert("Cannot be empty!",
					() => dom.setValue("Pseudo", "",
						() => dom.focus("Pseudo")
					)
				);
			} else if (handlePseudo(result.toUpperCase())) {
				dom.pseudo = result;
				dom.addClass("PseudoButton", "hidden");
				dom.disableElements(["Pseudo", "PseudoButton"]);
				dom.enableElements(["Message", "MessageButton"]);
				dom.setValue("Pseudo", result);
				dom.focus("Message");
				console.log("\t>>>> New user: " + result);
			} else {
				dom.alert("Already used!",
					() => dom.setValue("Pseudo", result,
						() => dom.focus("Pseudo")
					)
				);
			}
		}
	);
}

function acSubmitMessage(dom, id) {
	dom.getValue("Message",
		(result) => {
			dom.setValue("Message", "",
				() => dom.focus("Message",
					() => {
						result = result.trim();
						if (result.length !== 0) {
							console.log("'" + dom.pseudo + "' : " + result);
							messages.push({
								"pseudo": dom.pseudo,
								"content": result
							});
							displayMessages(dom);
							atlas.broadcastAction("Update");
						}
					}
				)
			);
		}
	);
}

function main() {
	const callbacks = {
		"": acConnect,
		"SubmitPseudo": acSubmitPseudo,
		"SubmitMessage": acSubmitMessage,
		"Update": (dom) => displayMessages(dom)
	};

	atlas.launch(newSession, callbacks, head);

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
