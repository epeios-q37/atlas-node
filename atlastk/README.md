# *Node.js* version of the *Atlas* toolkit

![For Node.js](https://q37.info/download/assets/Node.png)

[![Run on Repl.it](https://repl.it/badge/github/epeios-q37/atlas-node)](https://q37.info/s/st7gccd4)
[![Version 0.11](https://img.shields.io/static/v1.svg?&color=90b4ed&label=Version&message=0.11)](http://github.com/epeios-q37/atlas-node/)
[![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-node.svg?style=social)](https://github.com/epeios-q37/atlas-node/stargazers)
[![license: MIT](https://img.shields.io/github/license/epeios-q37/atlas-node?color=yellow)](https://github.com/epeios-q37/atlas-node/blob/master/LICENSE)
[![Homepage](https://img.shields.io/static/v1?label=homepage&message=atlastk.org&color=ff69b4)](https://atlastk.org)

[![NPM badge of the Atlas toolkit](https://nodei.co/npm/atlastk.png)](https://npmjs.com/atlastk/ "NPM package of the Atlas toolkit")

*NOTA*: this toolkit is also available for:
- *Java*: <http://github.com/epeios-q37/atlas-java>,
- *Perl*: <http://github.com/epeios-q37/atlas-perl>,
- *Python*: <http://github.com/epeios-q37/atlas-python>,
- *Ruby*: <http://github.com/epeios-q37/atlas-ruby>.

---

With the [*Atlas* toolkit](http://atlastk.org/), it has never been easier to create your own modern web application ([*SPA*](https://q37.info/s/7sbmxd3j)):
- no front-end *Javascript* to write; only *HTML* and *Node.js*,
- no [front and back end architecture](https://q37.info/s/px7hhztd) to bother with,
- no [web server](https://q37.info/s/n3hpwsht) (*Apache*, *Nginx*…) to install,

and all this only with the help of a library of about 45 KB.

With the *Atlas* toolkit, your applications will be accessible from the entire internet on laptops, smartphones, tablets…, and this without having to deploy them on a remote server or to open an incoming port on your internet box. All you need is a local computer with a simple internet connection. 

The *Atlas* toolkit is also the fastest and easiest way to add a [graphical user interface](https://q37.info/s/hw9n3pjs) to all your programs.

If you want to use the *Atlas* toolkit without installing the examples, simply install the [*atlastk* package from *NPM*](https://q37.info/s/h3zjb39j) (`npm install atlastk`), which has no other dependencies.

You can also use the *Atlas* toolkit on [*Repl.it*](https://q37.info/s/mxmgq3qm), an [online IDE](https://q37.info/s/zzkzbdw7), so you have nothing to install, as you will see in the next section.

## Live demonstrations

Before diving into source code, you can take a look on some live demonstrations to see how applications based on the *Atlas* toolkit look like. You will find the [*15-puzzle* game](https://q37.info/s/jn9zg3bn), and also the *Atlas* toolkit version of the [*TodoMVC*](https://todomvc.com/) application, which looks like this:

![TodoMVC](https://q37.info/download/TodoMVC.gif "The TodoMVC application made with the Atlas toolkit")

To see all the live demonstrations, simply go [here](https://q37.info/s/st7gccd4), click on the green `run` button, select the demonstration you want to see, and then click (or scan with your smartphone) the then displayed [QR code](https://q37.info/s/3pktvrj7).

## *Hello, World!*

Here's how the [*Hello, World!*](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) program made with the *Atlas* toolkit looks like:

![Little demonstration](https://q37.info/download/assets/Hello.gif "A basic example")

This example is part of the live demonstrations above, but you can launch it on your computer:

- `git clone https://github.com/epeios-q37/atlas-node`
- `cd atlas-node`
- `npm install`
- `node Hello/main.js`

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

## Content of the repository

The `atlastk` directory contains the *JavaScript* source code for *Node.js* of the *Atlas* toolkit, which is not needed to run the examples.

The `node_modules` directory (not provided by the repository, but will be created when launching `npm install`) contains the files that are needed in order to use the *Atlas* toolkit.

All other directories are examples.

To launch an example:

- launch `npm install` (this have only to be do once),
- launch `node <Name>/main.js`,

where `<Name>` is the name of the example (`15-puzzle`, `Blank`, `Chatroom`…). For example `node Hello/main.js`.


