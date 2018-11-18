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
	along with XDHq. If not, see <http://www.gnu.org/licenses/>.
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
