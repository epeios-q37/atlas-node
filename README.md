# *Node.js* version of the *Atlas* toolkit

![For Node.js](http://q37.info/download/assets/Node.png "Node.js logo")

[![Version 0.9.2](https://img.shields.io/static/v1.svg?&color=90b4ed&label=Version&message=0.9.2)](http://q37.info/s/gei0veus)

[![NPM badge of the Atlas toolkit](http://nodei.co/npm/atlastk.png)](http://npmjs.com/atlastk/ "NPM package of the Atlas toolkit")

The *Atlas* toolkit, a fast and easy way to add a [graphical user interface](http://q37.info/s/hw9n3pjs) to your *Node.js* programs.

With the *Atlas* toolkit, both [front and back ends](http://q37.info/s/px7hhztd) are handled by the same code, and the programs will also be reachable from all over the internet.

Only basic knowledge of web technologies are required. And, with the *Atlas* toolkit, you can easily add a GUI to programs originally designed to have a [CLI](https://q37.info/s/cnh9nrw9), so the users of this programs can choose which interface they want to use.

If you want to use the *Atlas* toolkit without installing the examples, simply install the [*atlastk* package from *NPM*](http://q37.info/s/h3zjb39j) (`npm install atlastk`). This package has only one internal dependency, with no other dependencies.

You can also use the *Atlas* toolkit on [*Repl.it*](http://q37.info/s/mxmgq3qm), an [online IDE](http://q37.info/s/zzkzbdw7), so you have nothing to install. You will find some examples in the next sections. **Important**: you have to ***fork*** this examples before launching them (by clicking the dedicated button or by modifying the source code), or they won't work properly! See <http://q37.info/s/zbgfjtp9> for more details.

## *15-puzzle* game

Before we dive into source code, let's begin with a live demonstration of the [*15-puzzle* game](http://q37.info/s/jn9zg3bn) made with *Atlas* toolkit: <http://q37.info/s/dggtbvd4> ([more about live demonstrations](http://q37.info/s/zgvcwv7j))!

## *Hello, World!*

Here's how a [*Hello, World!*](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) type program made with the *Atlas* toolkit looks like:

![Little demonstration](http://q37.info/download/assets/Hello.gif "A basic example")

- `git clone http://github.com/epeios-q37/atlas-node`
- `cd atlas-node`
- `npm install`
- `node Hello/Hello.js`

You can also put below source code in a file and launch it after having installed the [*atlastk* package](http://q37.info/s/h3zjb39j) (`npm install atlastk`), or, with absolutely no installation, paste the below code [here](http://q37.info/s/nkcgqn7z), and open the displayed *URL* in a web browser.


For a live demonstration: <http://q37.info/s/xzfks7fk>.

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

For a live demonstration: <http://q37.info/s/mjqcz4z7>.

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