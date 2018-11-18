# *Node.js* version of the *Atlas* toolkit

![Node.js logo](https://q37.info/download/assets/Node.png "Node.js")

The [*Atlas* toolkit](https://atlastk.org/) is a library which facilitates the prototyping of web applications.

[![NPM badge of the Atlas toolkit](http://nodei.co/npm/atlastk.png)](http://npmjs.com/atlastk/ "NPM package of the Atlas toolkit")

## *Hello, World!*

Here's how a [*Hello, World!*](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) type application made with the *Atlas* toolkit looks like:

![Little demonstration](http://q37.info/download/assets/Hello.gif "A basic example")

For an online demonstration: <http://q37.info/runkit/Hello>.

Source code:

```javascript
const atlas = require( 'atlastk' );

// Content of 'Head.html'.
const head = `
<title>"Hello, World !" example</title>
<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAMFBMVEUEAvyEhsxERuS8urQsKuycnsRkYtzc2qwUFvRUVtysrrx0ctTs6qTMyrSUksQ0NuyciPBdAAABHklEQVR42mNgwAa8zlxjDd2A4POfOXPmzZkFCAH2M8fNzyALzDlzg2ENssCbMwkMOsgCa858YOjBKxBzRoHhD7LAHiBH5swCT9HQ6A9ggZ4zp7YCrV0DdM6pBpAAG5Blc2aBDZA68wCsZPuZU0BDH07xvHOmAGKKvgMP2NA/Zw7ADIYJXGDgLQeBBSCBFu0aoAPYQUadMQAJAE29zwAVWMCWpgB08ZnDQGsbGhpsgCqBQHNfzRkDEIPlzFmo0T5nzoMovjPHoAK8Zw5BnA5yDosDSAVYQOYMKIDZzkoDzagAsjhqzjRAfXTmzAQgi/vMQZA6pjtAvhEk0E+ATWRRm6YBZuScCUCNN5szH1D4TGdOoSrggtiNAH3vBBjwAQCglIrSZkf1MQAAAABJRU5ErkJggg==" />
<style type="text/css">
	html, body {
		height: 100%;
		padding: 0;
		margin: 0;
	}
  
	.vcenter-out, .hcenter {
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
```

## *TodoMVC*

And here's how the *Atlas* toolkit version of the [*TodoMVC*](http://todomvc.com/) application looks like: 

[![TodoMVC](http://q37.info/download/TodoMVC.gif "The TodoMVC application made with the Atlas toolkit")](https://github.com/epeios-q37/todomvc-java)

For an online demonstration: <http://q37.info/runkit/TodoMVC>.

## Content of the repository

The `Atlas` directory contains the *JavaScript* source code for *Node.js* of the *Atlas* toolkit, which is not needed to run the examples.

The `notes_modules` directory (not provided by the repository, but will be created when launching `npm install`) contains the files that are needed in order to use the *Atlas* toolkit.

All other directories are examples.

To launch an example:

- launch `npm install` (this have only to be do once),
- launch `node <Name>/main.js`,

where `<Name>` is the name of the example (`Blank`, `Chatroom`…).

The *Atlas* toolkit is also available for:

- *Java*: <http://github.com/epeios-q37/atlas-java>
- *PHP*: <http://github.com/epeios-q37/atlas-php>
- *Python*: <http://github.com/epeios-q37/atlas-python>

For more information about the *Atlas* toolkit, go to <http://atlastk.org/>.