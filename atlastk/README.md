<div align="center">

The *Atlas* toolkit is available for:

[![Java](https://s.q37.info/jrnv4mj4.svg)](https://github.com/epeios-q37/atlas-java) [![Node.js](https://s.q37.info/fh7v7kn9.svg)](https://github.com/epeios-q37/atlas-node) [![Perl](https://s.q37.info/hgnwnnn3.svg)](https://github.com/epeios-q37/atlas-perl) [![Python](https://s.q37.info/94937nbb.svg)](https://github.com/epeios-q37/atlas-python) [![Ruby](https://s.q37.info/zn4qrx9j.svg)](https://github.com/epeios-q37/atlas-ruby)

To see the *Atlas* toolkit in action:

[![Version 0.13](https://img.shields.io/static/v1.svg?&color=blue&labelColor=red&label=online&message=demonstrations&style=for-the-badge)](https://s.q37.info/sssznrb4)

</div>



# *Node.js* version of the *Atlas* toolkit

<div align="center">

[![Version 0.13](https://img.shields.io/static/v1.svg?&color=90b4ed&label=Version&message=0.13&style=for-the-badge)](http://github.com/epeios-q37/atlas-node/) [![license: MIT](https://img.shields.io/github/license/epeios-q37/atlas-node?color=yellow&style=for-the-badge)](https://github.com/epeios-q37/atlas-node/blob/master/LICENSE) [![Documentation](https://img.shields.io/static/v1?label=documentation&message=atlastk.org&color=ff69b4&style=for-the-badge)](https://atlastk.org) [![Version](https://img.shields.io/npm/v/atlastk?style=for-the-badge)](https://s.q37.info/h3zjb39j)

</div>



## A GUI with *Node.js* in a couple of minutes

Click the animation to see a screencast of programming this ["Hello, World!" program](https://en.wikipedia.org/wiki/%22Hello,_World!%22_program) with *Node.js* in a matter of minutes:

<div align="center">

[![Building a GUI in with *Node.js* in less then 10 minutes](https://s.q37.info/qp4z37pg.gif)](https://s.q37.info/4pcpvrhz)

</div>

Same video on [*Peertube*](https://en.wikipedia.org/wiki/PeerTube): <https://s.q37.info/9wtsrwqw>.

<details>
<summary>Click to see the corresponding source code</summary>

```javascript
const atlastk = require('atlastk');
 
const BODY = `
<fieldset>
 <input id="Input" xdh:onevent="Submit" value="World"/>
 <button xdh:onevent="Submit">Hello</button>
 <hr/>
 <fieldset>
  <output id="Output">Greetings displayed here!</output>
 </fieldset>
</fieldset>
`;
 
const CALLBACKS = {
 "": (dom, id) => dom.inner("", BODY,
  () => dom.focus("Input")),
 "Submit": (dom, id) => dom.getValue("Input",
  (name) => dom.begin("Output", "<div>Hello, " + name + "!</div>",
   () => dom.setValue("Input", "",
    () => dom.focus("Input")))),
};
 
atlastk.launch(() => new atlastk.DOM(), CALLBACKS);
```

</details>

### See for yourself right now - it's quick and easy!

```shell
# You can replace 'github.com' with 'framagit.org'.
# DON'T copy/paste this and above line!
git clone https://github.com/epeios-q37/atlas-node
cd atlas-node
npm install
cd examples
node Hello/main.js
```



## Your turn

If you want to take your code to the next level, from [CLI](https://s.q37.info/cnh9nrw9) to [GUI](https://s.q37.info/hw9n3pjs), then you found the right toolkit.

With the [*Atlas* toolkit](http://atlastk.org/), you transform your programs in modern web applications ([*SPA*](https://s.q37.info/7sbmxd3j)) without the usual hassles:
- no front-end *JavaScript* to write; only *HTML*(/*CSS*) and *Node.js*,
- no [front and back end architecture](https://s.q37.info/px7hhztd) to bother with,
- no [web server](https://s.q37.info/n3hpwsht) (*Apache*, *Nginx*…) to install,
- no need to deploy your application on a remote server,
- no incoming port to open on your internet box or routeur.

The *Atlas* toolkit is written in pure *Node.js*, with no native code and no dependencies, allowing the *Atlas* toolkit to be used on all environments where *Node.js* is available. 

And simply by running them on a local computer connected to internet, applications using the *Atlas* toolkit will be accessible from the entire internet on laptops, smartphones, tablets…

## Content of the repository

The `atlastk` directory contains the *JavaScript* source code for *Node.js* of the *Atlas* toolkit, which is not needed to run the examples.

The `node_modules` directory (not provided by the repository, but will be created when launching `npm install`) contains the files that are needed in order to use the *Atlas* toolkit.

The `examples` directory contains some examples.

To launch an example (from within the repository):

- launch `npm install` (this have only to be do once),
- `cd examples`,
- launch `node <Name>/main.js`,

where `<Name>` is the name of the example (`15-puzzle`, `Blank`, `Chatroom`…). For example `node Hello/main.js`.

