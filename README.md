# *Node.js* version of the *Atlas* toolkit

![For Node.js](http://q37.info/download/assets/Node.png "Node.js logo")

[![Version 0.9](https://img.shields.io/static/v1.svg?&color=90b4ed&label=Version&message=0.9)](http://q37.info/s/gei0veus)

A fast and easy way to add a graphical user interface to your *Node.js* programs.

With the *Atlas* toolkit, you obtain hybrid programs. Like desktop applications, the same code can handle both [front and back ends](http://q37.info/s/px7hhztd), and, like web applications, the programs will be reachable from all over the internet.

[![NPM badge of the Atlas toolkit](http://nodei.co/npm/atlastk.png)](http://npmjs.com/atlastk/ "NPM package of the Atlas toolkit")

## *15-puzzle* game

Before we dive into source code, let's begin with a live demonstration of the [*15-puzzle* game](http://q37.info/s/jn9zg3bn) made with *Atlas* toolkit: <http://q37.info/s/bmbgtt47> (other live demonstrations are available [here](http://q37.info/s/zgvcwv7j))!

## *Hello, World!*

Here's how a [*Hello, World!*](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) type program made with the *Atlas* toolkit looks like:

![Little demonstration](http://q37.info/download/assets/Hello.gif "A basic example")

- `git clone http://github.com/epeios-q37/atlas-node`
- `cd atlas-node`
- `npm install`
- `node Hello/Hello.js`

For a live demonstration: <http://q37.info/runkit/Hello>.

Source code:

```javascript
const atlas = require( 'atlastk' );

const body = `
<div style="display: table; margin: 50px auto auto auto;">
 <fieldset>
  <input id="input" maxlength="20" placeholder="Enter a name here" type="text"
         data-xdh-onevent="Submit" value="World"/>
  <div style="display: flex; justify-content: space-around; margin: 5px auto auto auto;">
   <button data-xdh-onevent="Submit">Submit</button>
   <button data-xdh-onevent="Clear">Clear</button>
  </div>
 </fieldset>
</div>
`;

const callbacks = {
    "": (dom, id) => dom.setLayout("", body,
        () => dom.focus("input")),
    "Submit": (dom, id) => dom.getContent("input",
        (name) => dom.alert("Hello, " + name + "!",
            () => dom.focus("input"))),
    "Clear": (dom, id) => dom.confirm("Are you sure ?",
        (answer) => { if (answer) dom.setContent("input", ""); dom.focus("input"); })
};

atlas.launch(() => new atlas.DOM(), callbacks);
```

## *TodoMVC*

And here's how the *Atlas* toolkit version of the [*TodoMVC*](http://todomvc.com/) application looks like:

![TodoMVC](http://q37.info/download/TodoMVC.gif "The TodoMVC application made with the Atlas toolkit")

For a live demonstration: <http://q37.info/runkit/TodoMVC>.

## Content of the repository

The `Atlas` directory contains the *JavaScript* source code for *Node.js* of the *Atlas* toolkit, which is not needed to run the examples.

The `notes_modules` directory (not provided by the repository, but will be created when launching `npm install`) contains the files that are needed in order to use the *Atlas* toolkit.

All other directories are examples.

To launch an example:

- launch `npm install` (this have only to be do once),
- launch `node <Name>/main.js`,

where `<Name>` is the name of the example (`15-puzzle`, `Blank`, `Chatroom`…).

The *Atlas* toolkit is also available for:

- *Java*: <http://github.com/epeios-q37/atlas-java>
- *PHP*: <http://github.com/epeios-q37/atlas-php>
- *Python*: <http://github.com/epeios-q37/atlas-python>
- *Ruby*: <http://github.com/epeios-q37/atlas-ruby>

For more information about the *Atlas* toolkit: <http://atlastk.org/>.