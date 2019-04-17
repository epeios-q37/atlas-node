/*
MIT License

Copyright (c) 2017 Claude SIMON (https://q37.info/s/rmnmqd49)

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

"use strict"

class XML {
	writeString_(string) {
		this.xml_ += string + "\0";
	}
	constructor(rootTag) {
		this.writeString_("dummy");
		this.writeString_(rootTag);
	}
	pushTag(tag) {
		this.xml_ += ">";
		this.writeString_(tag);
	}
	popTag() {
		this.xml_ += "<";
	}
	setAttribute(name, value) {
		this.xml_ += "A";
		this.writeString_(name);
		this.writeString_(value);
	}
	setValue(value) {
		this.xml_ += "V";
		this.writeString_(value);
	}
	toString() {
		return this.xml_;
	}
}

module.exports.XML = XML;
