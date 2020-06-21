# *Node.js* version of the *Atlas* toolkit

[![Run on Repl.it](https://repl.it/badge/github/epeios-q37/atlas-node)](https://q37.info/s/st7gccd4)
[![Version 0.11](https://img.shields.io/static/v1.svg?&color=90b4ed&label=Version&message=0.11)](http://github.com/epeios-q37/atlas-node/)
[![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-node.svg?style=social)](https://github.com/epeios-q37/atlas-node/stargazers)
[![license: MIT](https://img.shields.io/github/license/epeios-q37/atlas-node?color=yellow)](https://github.com/epeios-q37/atlas-node/blob/master/LICENSE)
[![Homepage](https://img.shields.io/static/v1?label=homepage&message=atlastk.org&color=ff69b4)](https://atlastk.org)

[![NPM badge of the Atlas toolkit](https://nodei.co/npm/atlastk.png)](https://npmjs.com/atlastk/ "NPM package of the Atlas toolkit")

> The [*Atlas* toolkit](https://atlastk.org) is available for:
> langage | repository address| popularity 
> -|-|-
> *Java* |<http://github.com/epeios-q37/atlas-java> |[![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-java.svg?style=social)](https://github.com/epeios-q37/atlas-java/stargazers)
> *Node.js* | <http://github.com/epeios-q37/atlas-node> | [![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-node.svg?style=social)](https://github.com/epeios-q37/atlas-node/stargazers)
> *Perl* |<http://github.com/epeios-q37/atlas-perl>|  [![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-perl.svg?style=social)](https://github.com/epeios-q37/atlas-perl/stargazers)
> *Python* | <http://github.com/epeios-q37/atlas-python> | [![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-python.svg?style=social)](https://github.com/epeios-q37/atlas-python/stargazers)
> *Ruby* | <http://github.com/epeios-q37/atlas-ruby> | [![Stars](https://img.shields.io/github/stars/epeios-q37/atlas-ruby.svg?style=social)](https://github.com/epeios-q37/atlas-ruby/stargazers)

---

## Straight to the point: the [*Hello, World!*](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) program

### Source code

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


### Result

[![Little demonstration](https://q37.info/download/assets/Hello.gif "A basic example")](https://q37.info/s/st7gccd4)

### Try it yourself now

#### Online, with nothing to install

Thanks to [Replit](https://q37.info/s/mxmgq3qm), an [online IDE](https://q37.info/s/zzkzbdw7), you can write and run programs using the *Atlas* toolkit directly in your web browser, without having to install *Node.js* on your computer.

To see some examples, like the following [*TodoMVC*](http://todomvc.com/) application or the above [*Hello, World!*](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) program, simply:
-  go [here](https://q37.info/s/st7gccd4) (or click on the [![Run on Repl.it](https://repl.it/badge/github/epeios-q37/atlas-node)](https://q37.info/s/st7gccd4) badge at the top of this page),
-  click on the green `run` button,
-  select the demonstration you want to see,
-  click (or scan with your smartphone) the then displayed [QR code](https://q37.info/s/3pktvrj7).

[![TodoMVC](https://q37.info/download/TodoMVC.gif "The TodoMVC application made with the Atlas toolkit")](https://q37.info/s/st7gccd4)

#### With *Node.js* on your computer

```
git clone https://github.com/epeios-q37/atlas-node
cd atlas-node
npm install
cd examples
node Hello/main.js
```

## Your turn

If you want to:

- take your code to the next level, from [CLI](https://q37.info/s/cnh9nrw9) to [GUI](https://q37.info/s/hw9n3pjs),
- teach your students to program a GUI, 
- impress your teacher with a blowing GUI,
- easily share your programs with all you family and friends,

then you found the right toolkit.

With the [*Atlas* toolkit](http://atlastk.org/), writing modern web applications ([*SPA*](https://q37.info/s/7sbmxd3j)) has never been this easy:
- no front-end *JavaScript* to write; only *HTML* and *Node.js*,
- no [front and back end architecture](https://q37.info/s/px7hhztd) to bother with,
- no [web server](https://q37.info/s/n3hpwsht) (*Apache*, *Nginx*…) to install,
- no need to deploy your application on a remote server,
- no incoming port to open on your internet box.

The *Atlas* toolkit is written in pure *Node.js*, with no native code and no dependencies, allowing the *Atlas* toolkit to be used on all environments where *Node.js* is available. 

Simply by running them on a local computer with a simple internet connexion, applications using the *Atlas* toolkit will be accessible from the entire internet on laptops, smartphones, tablets…

## Content of the repository

The `atlastk` directory contains the *JavaScript* source code for *Node.js* of the *Atlas* toolkit, which is not needed to run the examples.

The `node_modules` directory (not provided by the repository, but will be created when launching `npm install`) contains the files that are needed in order to use the *Atlas* toolkit.

The `examples` directory contains some examples.

To launch an example (from within the repository):

- launch `npm install` (this have only to be do once),
- `cd examples`,
- launch `node <Name>/main.js`,

where `<Name>` is the name of the example (`15-puzzle`, `Blank`, `Chatroom`…). For example `node Hello/main.js`.
