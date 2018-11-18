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

class TodoMVC extends atlas.DOM {
	constructor() {
		super();
		this.timestamp = new Date();
		this.exclude = null;
		this.index = -1;
		this.todos = [
			{
				"completed": true,
				"label": "Note 1"
			}, {
				"completed": false,
				"label": "Note 2"
			}
		];
		this.todos = [];
	}
	itemsLeft() {
		var i = this.todos.length;
		var count = 0;

		while (i--) {
			if (!this.todos[i]['completed'])
				count++;
		}

		return count;
	}
}

function displayCount(dom, count) {
	var text = "";

	switch (count) {
		case 0:
			break;
		case 1:
			text = "1 item left";
			break;
		default:
			text = count + " items left";
			break;
	}

	dom.setContent("Count", text);
}

function handleCount(dom) {
	var count = dom.itemsLeft();

	if (count != dom.todos.length)
		dom.disableElement("HideClearCompleted",
			() => displayCount(dom, count)
		)
	else
		dom.enableElement("HideClearCompleted",
			() => displayCount(dom, count)
		)
}

function displayTodos(dom) {
	var xml = atlas.createXML('XDHTML');
	var i = 0;
	var todo;

	dom.index = -1;

	xml.pushTag("Todos");

	while (i < dom.todos.length) {
		todo = dom.todos[i];
		xml.pushTag('Todo');
		xml.setAttribute('id', i);
		xml.setAttribute('completed', todo["completed"]);
		xml.setValue(todo["label"]);
		xml.popTag();;
		i++;
	}

	xml.popTag();

	dom.setLayoutXSL("Todos", xml, xsl,
		() => handleCount(dom)
	);
}

function newSession() {
	return new TodoMVC();
}

function acConnect(dom, id) {
	dom.setLayout("", body,
		() => dom.focus("Input",
			() => dom.disableElements(["HideActive", "HideCompleted"],
				() => displayTodos(dom)
			)
		)
	);
}

function submitNew(dom) {
	dom.getContent("Input",
		(content) => dom.setContent("Input", "",
			() => {
				if (content.trim() != "") {
					dom.todos.unshift(
						{
							"completed": false,
							"label": content
						}
					);
					displayTodos(dom);
				}
			}
		)
	);
}

function submitModification(dom) {
	let id = dom.index;
	dom.index = -1;

	dom.getContent("Input." + id,
		(content) => dom.setContent("Input." + id, "",
			() => {
				if (content.trim() != "") {
					dom.todos[id]['label'] = content;
					dom.setContent("Label." + id, content,
						() => dom.removeClasses(
							{
								["View." + id]: "hide",
								["Todo." + id]: "editing"
							}
						)
					);
				} else {
					dom.todos.splice(id, 1);
					displayTodos(dom);
				}
			}
		)
	);
}

function acSubmit(dom, id) {
	if (dom.index == -1) {
		submitNew(dom);
	} else {
		submitModification(dom);
	}
}

function acDestroy(dom, id) {
	dom.getContent(id,
		(content) => {
			dom.todos.splice(parseInt(content), 1);
			displayTodos(dom);
		}
	);
}

function acToggle(dom, id) {
	var i = parseInt(id);

	dom.todos[i]['completed'] = !dom.todos[i]['completed'];

	// Can't use 'ToggleClasses', because then 2 elements would have same key...
	dom.toggleClass("Todo." + id, "completed",
		() => dom.toggleClass("Todo." + id, "active",
			() => handleCount(dom)
		)
	);
}

function acAll(dom, id) {
	dom.exclude = null;

	dom.addClass("All", "selected",
		() => dom.removeClasses(
			{
				"Active": "selected",
				"Completed": "selected"
			},
			() => dom.disableElements(["HideActive", "HideCompleted"])
		)
	)
}

function acActive(dom, id) {
	dom.exclude = true;

	dom.addClass("Active", "selected",
		() => dom.removeClasses(
			{
				"All": "selected",
				"Completed": "selected"
			},
			() => dom.disableElement("HideActive",
				() => dom.enableElement("HideCompleted"))
		)
	)
}

function acCompleted(dom, id) {
	dom.exclude = false;

	dom.addClass("Completed", "selected",
		() => dom.removeClasses(
			{
				"All": "selected",
				"Active": "selected"
			},
			() => dom.disableElement("HideCompleted",
				() => dom.enableElement("HideActive"))
		)
	)
}

function acClear(dom, id) {
	var i = 0;

	while (i < dom.todos.length) {
		if (dom.todos[i]['completed'])
			dom.todos.splice(i, 1);
		else
			i++;
	}

	displayTodos(dom);
}

function acEdit(dom, id) {
	dom.getContent(id,
		(content) => dom.addClasses(
			{
				["View." + content]: "hide",
				[id]: "editing"
			},
			() => {
				dom.index = parseInt(content);
				dom.setContent("Input." + content, dom.todos[dom.index]['label'],
					() => dom.focus("Input." + content))
			}
		)
	);
}

function acCancel(dom, id) {
	var id = dom.index;
	dom.index = -1;

	dom.setContent("Input." + id, "",
		() => dom.removeClasses(
			{
				["View." + id]: "hide",
				["Todo." + id]: "editing"
			}
		)
	);
}

function main() {
	var callbacks = {
		"Connect": acConnect,
		"Submit": acSubmit,
		"Destroy": acDestroy,
		"Toggle": acToggle,
		"All": acAll,
		"Active": acActive,
		"Completed": acCompleted,
		"Clear": acClear,
		"Edit": acEdit,
		"Cancel": acCancel,
	};

	atlas.launch(newSession, "Connect", callbacks, head);
};

const head = `
<title>Atlas • TodoMVC</title>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUEAvyEhsxERuS8urQsKuycnsRkYtzc2qwUFvRUVtysrrx0ctTs6qTMyrSUksQ0NuyciPBdAAABHklEQVR42mNgwAa8zlxjDd2A4POfOXPmzZkFCAH2M8fNzyALzDlzg2ENssCbMwkMOsgCa858YOjBKxBzRoHhD7LAHiBH5swCT9HQ6A9ggZ4zp7YCrV0DdM6pBpAAG5Blc2aBDZA68wCsZPuZU0BDH07xvHOmAGKKvgMP2NA/Zw7ADIYJXGDgLQeBBSCBFu0aoAPYQUadMQAJAE29zwAVWMCWpgB08ZnDQGsbGhpsgCqBQHNfzRkDEIPlzFmo0T5nzoMovjPHoAK8Zw5BnA5yDosDSAVYQOYMKIDZzkoDzagAsjhqzjRAfXTmzAQgi/vMQZA6pjtAvhEk0E+ATWRRm6YBZuScCUCNN5szH1D4TGdOoSrggtiNAH3vBBjwAQCglIrSZkf1MQAAAABJRU5ErkJggg==" />
<!-- Only both lines below change between 'PROD' and 'DEMO' files. -->
<link rel="stylesheet" href="http://q37.info/download/assets/TodoMVC/todomvc-common/base.css">
<link rel="stylesheet" href="http://q37.info/download/assets/TodoMVC/todomvc-app-css/index.css">
<style>
	.hide {
		display: none;
	}
</style>
<style id="HideClearCompleted">
	.clear-completed {
		display: none;
	}
</style>
<style id="HideCompleted">
	.completed {
		display: none;
	}
</style>
<style id="HideActive">
	.active {
		display: none;
	}
</style>
`;

const body = `
<section class="todoapp">
	<header class="header">
		<h1>todos</h1>
		<input id="Input" class="new-todo" placeholder="What needs to be done?" autofocus="" data-xdh-onevent="Submit"/>
	</header>
	<section class="main">
		<input class="toggle-all" type="checkbox"/>
		<label for="toggle-all">Mark all as complete</label>
		<ul class="todo-list" id="Todos"/>
	</section>
	<footer class="footer">
		<span class="todo-count" id="Count"></span>
		<ul class="filters">
			<li>
				<a style="cursor: pointer;" id="All" class="selected" data-xdh-onevent="All">All</a>
			</li>
			<li>
				<a style="cursor: pointer;" id="Active" data-xdh-onevent="Active">Active</a>
			</li>
			<li>
				<a style="cursor: pointer;" id="Completed" data-xdh-onevent="Completed">Completed</a>
			</li>
		</ul>
		<button class="clear-completed" data-xdh-onevent="Clear">Clear completed</button>
	</footer>
</section>
<footer class="info">
	<p>Double-click to edit a todo</p>
	<p>
		<span>Created with the </span>
		<a href="http://atlastk.org/">
			<span style="font-style: italic;">Atlas</span>
			<span> toolkit</span>
		</a>
		<span>!</span>
	</p>
</footer>
`;

// Note to developer:
// DON'T PASTE TO Visual Studio : it inserts extraneous characters !
// There must be NO characters before the XML declaration !
const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" encoding="UTF-8"/>
	<xsl:template match="/XDHTML">
		<xsl:apply-templates select="Todos"/>
	</xsl:template>
	<xsl:template match="Todos">
		<xsl:apply-templates select="Todo"/>
	</xsl:template>
	<xsl:template match="Todo">
		<li id="Todo.{@id}" data-xdh-onevents="(dblclick|Edit)" data-xdh-value="{@id}">
			<xsl:attribute name="class">
				<xsl:text>view</xsl:text>
				<xsl:choose>
					<xsl:when test="@completed='true'">
						<xsl:text> completed</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text> active</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<span id="View.{@id}">
				<input class="toggle" type="checkbox" id="{@id}" data-xdh-onevent="Toggle">
					<xsl:if test="@completed='true'">
						<xsl:attribute name="checked"/>
					</xsl:if>
				</input>
				<label id="Label.{@id}">
					<xsl:value-of select="."/>
				</label>
				<button data-xdh-value="{@id}" class="destroy" data-xdh-onevent="Destroy"/>
			</span>
			<input id="Input.{@id}" class="edit" data-xdh-onevent="Submit" data-xdh-onevents="(keyup|Cancel|Esc)(blur|Submit)"/>
		</li>
	</xsl:template>
</xsl:stylesheet>
`;

main();