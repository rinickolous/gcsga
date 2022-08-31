export function XMLtoJS(xml: string) {
	if (xml === "test") xml = testfile;
	const xmlDoc = parseXml(xml.replace(/\\/g, "\\\\"));
	console.log(xmlDoc);
	return JSON.parse(xml2json(xmlDoc, ""));
}

function parseXml(xml: string) {
	let dom = null;
	if (window.DOMParser) {
		try {
			dom = new DOMParser().parseFromString(xml, "text/xml");
		} catch (e) {
			dom = null;
		}
	} else alert("cannot parse xml string!");
	return dom;
}

/*	This work is licensed under Creative Commons GNU LGPL License.

	License: http://creativecommons.org/licenses/LGPL/2.1/
   Version: 0.9
	Author:  Stefan Goessner/2006
	Web:     http://goessner.net/ 
*/
function xml2json(xml: any, tab?: any) {
	let X = {
		toObj: function (xml: any) {
			let o: any = {};
			if (xml.nodeType == 1) {
				// element node ..
				if (xml.attributes.length)
					// element with attributes  ..
					for (let i = 0; i < xml.attributes.length; i++)
						o["@" + xml.attributes[i].nodeName] = (
							xml.attributes[i].nodeValue || ""
						).toString();
				if (xml.firstChild) {
					// element has child nodes ..
					let textChild = 0,
						cdataChild = 0,
						hasElementChild = false;
					for (let n = xml.firstChild; n; n = n.nextSibling) {
						if (n.nodeType == 1) hasElementChild = true;
						else if (
							n.nodeType == 3 &&
							n.nodeValue.match(/[^ \f\n\r\t\v]/)
						)
							textChild++; // non-whitespace text
						else if (n.nodeType == 4) cdataChild++; // cdata section node
					}
					if (hasElementChild) {
						if (textChild < 2 && cdataChild < 2) {
							// structured element with evtl. a single text or/and cdata node ..
							X.removeWhite(xml);
							for (let n = xml.firstChild; n; n = n.nextSibling) {
								if (n.nodeType == 3)
									// text node
									o["#text"] = X.escape(n.nodeValue);
								else if (n.nodeType == 4)
									// cdata node
									o["#cdata"] = X.escape(n.nodeValue);
								else if (o[n.nodeName]) {
									// multiple occurence of element ..
									if (o[n.nodeName] instanceof Array)
										o[n.nodeName][o[n.nodeName].length] =
											X.toObj(n);
									else
										o[n.nodeName] = [
											o[n.nodeName],
											X.toObj(n),
										];
								} // first occurence of element..
								else o[n.nodeName] = X.toObj(n);
							}
						} else {
							// mixed content
							if (!xml.attributes.length)
								o = X.escape(X.innerXml(xml));
							else o["#text"] = X.escape(X.innerXml(xml));
						}
					} else if (textChild) {
						// pure text
						if (!xml.attributes.length)
							o = X.escape(X.innerXml(xml));
						else o["#text"] = X.escape(X.innerXml(xml));
					} else if (cdataChild) {
						// cdata
						if (cdataChild > 1) o = X.escape(X.innerXml(xml));
						else
							for (let n = xml.firstChild; n; n = n.nextSibling)
								o["#cdata"] = X.escape(n.nodeValue);
					}
				}
				if (!xml.attributes.length && !xml.firstChild) o = null;
			} else if (xml.nodeType == 9) {
				// document.node
				o = X.toObj(xml.documentElement);
			} else alert("unhandled node type: " + xml.nodeType);
			return o;
		},
		toJson: function (o: any, name: any, ind: any) {
			let json = name ? '"' + name + '"' : "";
			if (o instanceof Array) {
				for (let i = 0, n = o.length; i < n; i++)
					o[i] = X.toJson(o[i], "", ind + "\t");
				json +=
					(name ? ":[" : "[") +
					(o.length > 1
						? "\n" +
						  ind +
						  "\t" +
						  o.join(",\n" + ind + "\t") +
						  "\n" +
						  ind
						: o.join("")) +
					"]";
			} else if (o == null) json += (name && ":") + "null";
			else if (typeof o == "object") {
				let arr = [];
				for (let m in o)
					arr[arr.length] = X.toJson(o[m], m, ind + "\t");
				json +=
					(name ? ":{" : "{") +
					(arr.length > 1
						? "\n" +
						  ind +
						  "\t" +
						  arr.join(",\n" + ind + "\t") +
						  "\n" +
						  ind
						: arr.join("")) +
					"}";
			} else if (typeof o == "string")
				json += (name && ":") + '"' + o.toString() + '"';
			else json += (name && ":") + o.toString();
			return json;
		},
		innerXml: function (node: any) {
			let s = "";
			if ("innerHTML" in node) s = node.innerHTML;
			else {
				let asXml = function (n: any) {
					let s = "";
					if (n.nodeType == 1) {
						s += "<" + n.nodeName;
						for (let i = 0; i < n.attributes.length; i++)
							s +=
								" " +
								n.attributes[i].nodeName +
								'="' +
								(n.attributes[i].nodeValue || "").toString() +
								'"';
						if (n.firstChild) {
							s += ">";
							for (let c = n.firstChild; c; c = c.nextSibling)
								s += asXml(c);
							s += "</" + n.nodeName + ">";
						} else s += "/>";
					} else if (n.nodeType == 3) s += n.nodeValue;
					else if (n.nodeType == 4)
						s += "<![CDATA[" + n.nodeValue + "]]>";
					return s;
				};
				for (let c = node.firstChild; c; c = c.nextSibling)
					s += asXml(c);
			}
			return s;
		},
		escape: function (txt: string) {
			return txt
				.replace(/[\\]/g, "\\\\")
				.replace(/[\"]/g, '\\"')
				.replace(/[\n]/g, "\\n")
				.replace(/[\r]/g, "\\r");
		},
		removeWhite: function (e: any) {
			e.normalize();
			for (let n = e.firstChild; n; ) {
				if (n.nodeType == 3) {
					// text node
					if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) {
						// pure whitespace text node
						let nxt = n.nextSibling;
						e.removeChild(n);
						n = nxt;
					} else n = n.nextSibling;
				} else if (n.nodeType == 1) {
					// element node
					X.removeWhite(n);
					n = n.nextSibling;
				} // any other node
				else n = n.nextSibling;
			}
			return e;
		},
	};
	if (xml.nodeType == 9)
		// document node
		xml = xml.documentElement;
	let json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
	return (
		"{\n" +
		tab +
		(tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) +
		"\n}"
	);
}

const testfile = `<?xml version="1.0" encoding="utf-8"?>
<gca5 xmlns="gca5">
  <character>
    <author>
      <name>GURPS Character Assistant</name>
      <version>GCA5Engine, Version=5.0.189.0</version>
      <copyright>Program code is copyright © 1995-2022 by Armin D. Sykes. All data files, graphics, and other GURPS-specific content is copyright © 2005 and other years by Steve Jackson Games Incorporated. GURPS and the all-seeing pyramid are registered trademarks of Steve Jackson Games Incorporated. All rights reserved.</copyright>
      <datecreated>31 August 2022</datecreated>
    </author>
    <system>
      <version>5</version>
      <lastkey>10208</lastkey>
    </system>
    <library>
      <name>%user%\\default.gds</name>
      <book>%sys%\\GURPS Basic Set 4th Ed.--Characters.gdf</book>
    </library>
    <settings>
      <ruleof>20</ruleof>
      <globalruleof>0</globalruleof>
      <modmultpercents>0</modmultpercents>
      <usediceaddsconversion>0</usediceaddsconversion>
      <allownoniqoptspecs>0</allownoniqoptspecs>
      <allowstackingdeflect>0</allowstackingdeflect>
      <allowstackingfortify>0</allowstackingfortify>
      <inplay>0</inplay>
      <showcharactertraitsymbols>-1</showcharactertraitsymbols>
      <rendernonloadoutitemsinactive>0</rendernonloadoutitemsinactive>
      <grayoutinactiveitems>-1</grayoutinactiveitems>
      <includeunassigneditemsincurrentloadout>0</includeunassigneditemsincurrentloadout>
      <nodefaultleveldiscount>0</nodefaultleveldiscount>
      <allowusertraitordering>0</allowusertraitordering>
      <flagoverspentskills>-1</flagoverspentskills>
      <applydbtoactivedefenses>0</applydbtoactivedefenses>
      <traitgrouping count="12">
        <groupingoptions>
          <traittype>Attributes</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Languages</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Cultures</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Advantages</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Perks</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Disadvantages</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Quirks</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Features</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Skills</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Spells</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Equipment</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
        <groupingoptions>
          <traittype>Templates</traittype>
          <groupingtype>None</groupingtype>
          <specifiedtag />
          <includetagpartinheader>-1</includetagpartinheader>
          <specifiedvaluesonly>0</specifiedvaluesonly>
          <specifiedvalueslist />
          <groupsatend>0</groupsatend>
          <treataslist>0</treataslist>
        </groupingoptions>
      </traitgrouping>
    </settings>
    <name>Character 1</name>
    <player />
    <bodytype>Humanoid</bodytype>
    <bodyimagefile />
    <currentloadout />
    <currenttransform />
    <output>
      <sheetviewsheet>GURPS 4th Edition Official Character Sheet</sheetviewsheet>
      <charactersheet>GURPS 4th Edition Official Character Sheet</charactersheet>
      <exportsheet>Simple Text Export</exportsheet>
    </output>
    <vitals>
      <race>Human</race>
      <height />
      <weight />
      <age />
      <appearance />
      <portraitfile />
    </vitals>
    <basicdefense>
      <parryidkey>10024</parryidkey>
      <parryusing>DX</parryusing>
      <parryscore>10</parryscore>
      <blockidkey>10024</blockidkey>
      <blockusing>DX</blockusing>
      <blockscore>8</blockscore>
    </basicdefense>
    <description><![CDATA[]]></description>
    <notes><![CDATA[]]></notes>
    <body count="26">
      <name>Humanoid</name>
      <description>Stock humanoid. B 552</description>
      <bodyitem>
        <name>Vitals</name>
        <cat />
        <group>Skin, All, Full Suit, Body, Torso, Vitals</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Head</name>
        <cat />
        <group>Head, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Eyes</name>
        <cat />
        <group>Head, Eyes, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>142</posx>
        <posy>40</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>0</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Left Eye</name>
        <cat />
        <group>Head, Left Eye, Eyes, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>0</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Right Eye</name>
        <cat />
        <group>Head, Right Eye, Eyes, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>0</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Neck</name>
        <cat />
        <group>Neck, Body, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>135</posx>
        <posy>108</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Skull</name>
        <cat />
        <group>Head, Skull, Skin, All</group>
        <basedb>0</basedb>
        <basedr>2</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>336</posx>
        <posy>23</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>11</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Face</name>
        <cat />
        <group>Head, Face, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>328</posx>
        <posy>81</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Torso</name>
        <cat />
        <group>Torso, Body, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>100</posx>
        <posy>179</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Groin</name>
        <cat />
        <group>Groin, Body, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>393</posx>
        <posy>449</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Arms</name>
        <cat />
        <group>Arms, Limbs, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>401</posx>
        <posy>212</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Left Arm</name>
        <cat />
        <group>Left Arm, Arms, Limbs, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Right Arm</name>
        <cat />
        <group>Right Arm, Arms, Limbs, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Hands</name>
        <cat />
        <group>Hands, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>417</posx>
        <posy>293</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Left Hand</name>
        <cat />
        <group>Left Hand, Hands, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Right Hand</name>
        <cat />
        <group>Right Hand, Hands, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Legs</name>
        <cat />
        <group>Legs, Limbs, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>349</posx>
        <posy>555</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Left Leg</name>
        <cat />
        <group>Left Leg, Legs, Limbs, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Right Leg</name>
        <cat />
        <group>Right Leg, Legs, Limbs, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Feet</name>
        <cat />
        <group>Feet, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>-1</display>
        <posx>349</posx>
        <posy>640</posy>
        <width>0</width>
        <height>0</height>
        <expanded>-1</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Left Foot</name>
        <cat />
        <group>Left Foot, Feet, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Right Foot</name>
        <cat />
        <group>Right Foot, Feet, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Body</name>
        <cat />
        <group>Body, Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Full Suit</name>
        <cat />
        <group>Full Suit, Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>Skin</name>
        <cat />
        <group>Skin, All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>9</dr>
        <hp>0</hp>
      </bodyitem>
      <bodyitem>
        <name>All</name>
        <cat />
        <group>All</group>
        <basedb>0</basedb>
        <basedr>0</basedr>
        <basehp>0</basehp>
        <display>0</display>
        <posx>0</posx>
        <posy>0</posy>
        <width>0</width>
        <height>0</height>
        <expanded>0</expanded>
        <layers>0</layers>
        <db>0</db>
        <dr>0</dr>
        <hp>0</hp>
      </bodyitem>
    </body>
    <hitlocationtable>
      <name>Humanoid</name>
      <description>Stock humanoid. B 552</description>
      <hitlocationline>
        <roll>-</roll>
        <location>Eye</location>
        <penalty>-9</penalty>
        <notes>1,2</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>3-4</roll>
        <location>Skull</location>
        <penalty>-7</penalty>
        <notes>1,3</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>5</roll>
        <location>Face</location>
        <penalty>-5</penalty>
        <notes>1,4</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>6-7</roll>
        <location>Right Leg</location>
        <penalty>-2</penalty>
        <notes>5</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>8</roll>
        <location>Right Arm</location>
        <penalty>-2</penalty>
        <notes>5,6</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>9-10</roll>
        <location>Torso</location>
        <penalty>0</penalty>
        <notes />
      </hitlocationline>
      <hitlocationline>
        <roll>11</roll>
        <location>Groin</location>
        <penalty>-3</penalty>
        <notes>1,7</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>12</roll>
        <location>Left Arm</location>
        <penalty>-2</penalty>
        <notes>5,6</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>13-14</roll>
        <location>Left Leg</location>
        <penalty>-2</penalty>
        <notes>5</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>15</roll>
        <location>Hand</location>
        <penalty>-4</penalty>
        <notes>6,8,9</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>16</roll>
        <location>Foot</location>
        <penalty>-4</penalty>
        <notes>8,9</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>17-18</roll>
        <location>Neck</location>
        <penalty>-5</penalty>
        <notes>1,10</notes>
      </hitlocationline>
      <hitlocationline>
        <roll>-</roll>
        <location>Vitals</location>
        <penalty>-3</penalty>
        <notes>1,11</notes>
      </hitlocationline>
      <hitlocationnote>
        <key>1</key>
        <value>An attack that misses by 1 hits the torso instead.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>2</key>
        <value>Only impaling, piercing, and tight-beam burning attacks can target the eye – and only from the front or sides. Injury over HP/10 blinds the eye. Otherwise, treat as skull, but without the extra DR!</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>3</key>
        <value>The skull gets an extra DR 2. Wounding modifier is ¥4. Knockdown rolls are at -10. Critical hits use the Critical Head Blow Table (p. 556). Exception: These special effects do not apply to toxic damage.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>4</key>
        <value>Jaw, cheeks, nose, ears, etc. If the target has an open-faced helmet, ignore its DR. Knockdown rolls are at -5. Critical hits use the Critical Head Blow Table. Corrosion damage gets a ¥1.5 wounding modifier, and if it inflicts a major wound, it also blinds one eye (both eyes on damage over full HP). Random attacks from behind hit the skull instead.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>5</key>
        <value>Limb. Reduce the wounding multiplier of large piercing, huge piercing, and impaling damage to ¥1. Any major wound (loss of over 1/2 HP from one blow) cripples the limb. Damage beyond that threshold is lost.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>6</key>
        <value>If holding a shield, double the penalty to hit: -4 for shield arm, -8 for shield hand.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>7</key>
        <value>Human males and the males of similar species suffer double shock from crushing damage, and get -5 to knockdown rolls. Otherwise, treat as a torso hit.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>8</key>
        <value>Extremity. Treat as a limb, except that damage over 1/3 HP in one blow inflicts a crippling major wound. Excess damage is still lost.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>9</key>
        <value>If rolling randomly, roll 1d: 1-3 is right, 4-6 is left.</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>10</key>
        <value>Neck and throat. Increase the wounding multiplier of crushing and corrosion attacks to ¥1.5, and that of cutting damage to ¥2. At the GM’s option, anyone killed by a cutting blow to the neck is decapitated!</value>
      </hitlocationnote>
      <hitlocationnote>
        <key>11</key>
        <value>Heart, lungs, kidneys, etc. Increase the wounding modifier for an impaling or any piercing attack to ¥3. Increase the wounding modifier for a tight-beam burning attack to ¥2. Other attacks cannot target the vitals.</value>
      </hitlocationnote>
    </hitlocationtable>
    <traits>
      <attributes count="142">
        <trait type="Attributes" idkey="10001">
          <name>--------------------</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>3</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>13</mainwin>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10002">
          <name>Air Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Air Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <up>2</up>
            <down>-2</down>
            <step>1</step>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10003">
          <name>Appealing</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10004">
          <name>Basic Air Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if(@itemhasmod(AD:Flight, Gliding) THEN ST:Basic Move ELSE @if(@itemhasmod(AD:Flight, Controlled Gliding) THEN ST:Basic Move ELSE @if(AD:Flight THEN @if(@itemhasmod(Flight, Space Flight Only) THEN 0 ELSE 2 * ST:Basic Speed) ELSE 0 )))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10005">
          <name>Basic Brachiation Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if(AD:Brachiator THEN ST:Basic Move / 2 ELSE 0)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10006">
          <name>Basic Ground Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>6</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if("DI:No Legs (Aerial)" THEN 0 ELSE @if("DI:No Legs (Aquatic)" THEN 0 ELSE @if("DI:No Legs (Semi-Aquatic)" THEN ST:Basic Move/5 ELSE @if("DI:No Legs (Sessile)" THEN 0 ELSE ST:Basic Move))))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>6</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10007">
          <name>Basic Lift</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>BL</symbol>
          <points>0</points>
          <score>20</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@int(100 * ST:Lifting ST * ST:Lifting ST / @if(ST:Metric = 1 THEN 11 ELSE 5))/100</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>@if(ST:Lifting ST::score &lt;= 7 then 0 else 1)</round>
            <basescore>20</basescore>
          </calcs>
          <armordata />
          <ref>
            <units>lb|kg</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10008">
          <name>Basic Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>6</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if("DI:No Legs (Sessile)" THEN 0 ELSE ST:Basic Speed)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>5</up>
            <down>-5</down>
            <step>1</step>
            <round>-1</round>
            <basescore>6</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>10</mainwin>
            <display>No</display>
            <disadat>-1</disadat>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10009">
          <name>Basic Space Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if(@itemhasmod(AD:Flight, Newtonian Space Flight) THEN 2 * Basic Speed ELSE @if(@itemhasmod(AD:Flight, Space Flight) THEN 2 * Basic Speed ELSE @if(@itemhasmod(AD:Flight, Space Flight Only) THEN 2 * Basic Speed ELSE 0 )))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10010">
          <name>Basic Speed</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>6</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>(ST:HT + ST:DX) / 4</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>5</up>
            <down>-5</down>
            <step>0.25</step>
            <basescore>6</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>9</mainwin>
            <display>No</display>
            <disadat>-1</disadat>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10011">
          <name>Basic Water Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>1</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Move / @if(AD:Amphibious THEN 1 ELSE @if("DI:No Legs (Aquatic)" THEN 1 ELSE @if("DI:No Legs (Semi-Aquatic)" THEN 1 ELSE 5)))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>1.2</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10012">
          <name>Bite</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Striking ST</basevalue>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <mods>Combat Table</mods>
            <display>no</display>
          </ref>
          <attackmodes count="1">
            <attackmode>
              <name>Bite</name>
              <damagebasedon>ST:Bite</damagebasedon>
              <reachbasedon>ST:Neck Reach</reachbasedon>
              <damage>thr-1 + @if("SK:Brawling::level" &gt; ST:DX+1 then @basethdice(ST:Bite) else 0) + -@if("DI:Weak Bite::level" = 1 then 2 * @basethdice(ST:Bite) else 0)</damage>
              <damtype>$if("AD:Teeth (Sharp Teeth)::level" = 1 THEN "cut" ELSE $if("AD:Teeth (Sharp Beak)::level" = 1 THEN "pi+" ELSE $if("AD:Teeth (Fangs)::level" = 1 THEN "imp" ELSE $if("AD:Vampiric Bite::level" = 1 THEN "cut" ELSE "cr"))))</damtype>
              <parry>No</parry>
              <reach>C</reach>
              <skillused>ST:DX, SK:Brawling</skillused>
              <charparry>No</charparry>
              <chareffectivest>10</chareffectivest>
              <charskillscore>12</charskillscore>
              <charskillused>"ST:DX"</charskillused>
              <charparryscore>No</charparryscore>
              <charskillusedkey>k10024</charskillusedkey>
              <chardamage>1d-3</chardamage>
              <dmg>thr</dmg>
              <chardamtype>imp</chardamtype>
              <charreach>C</charreach>
              <itemnotes>{Brawling (p. B182) increases all unarmed damage; Claws (p. B42) and Karate (p. B203) improve damage with punches and kicks (Claws don't affect damage with brass knuckles or boots); and Boxing (p. B182) improves punching damage.}</itemnotes>
            </attackmode>
          </attackmodes>
        </trait>
        <trait type="Attributes" idkey="10013">
          <name>Block</name>
          <bonuslist>+1 from 'Combat Reflexes'</bonuslist>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>1</score>
          <level>0</level>
          <calcs>
            <syslevels>1</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10014">
          <name>Brachiation Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Brachiation Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10015">
          <name>Broad Jump</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>9</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>(((2 * @max(ST:Basic Ground Move, SK:Jumping::level / 2)) - 3) / @if(ST:Metric = 1 THEN 3 ELSE 1)) * (2 ^ ST:Super Jump)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>9</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B352</page>
            <units>ft | m</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10016">
          <name>Carry on Back</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>300</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>15 * ST:Basic Lift</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>300</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10017">
          <name>Consciousness Check</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>12</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:HT::score</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>12</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>yes</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10018">
          <name>Cost of Living</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>600</score>
          <level>4</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@indexedvalue(ST:Status::score + 3, 100, 300, 600, 1200, 3000, 12000, 60000, 600000, 6000000, 60000000, 600000000)</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <round>1</round>
            <basescore>600</basescore>
          </calcs>
          <armordata />
          <ref>
            <description>The /typical/ Cost of Living for the character's selected Status Level, as calculated from the 'Cost of Living' table on p. B265</description>
            <mainwin>18</mainwin>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10019">
          <name>Damage Base</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>DamageBase</symbol>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Striking ST</basevalue>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10020">
          <name>DB</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10021">
          <name>Death Check</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>12</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:HT::score</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>12</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>yes</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10022">
          <name>Dodge</name>
          <bonuslist>+1 from 'Combat Reflexes'</bonuslist>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>1</syslevels>
            <basevalue>ST:Basic Speed + 3</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>9</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10023">
          <name>DR</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>DR</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10024">
          <name>DX</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>DX</symbol>
          <points>40</points>
          <score>12</score>
          <level>2</level>
          <parrylevel>10</parrylevel>
          <blocklevel>8</blocklevel>
          <calcs>
            <syslevels>0</syslevels>
            <basepoints>40</basepoints>
            <premodspoints>40</premodspoints>
            <basevalue>10</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>20</up>
            <down>-20</down>
            <step>1</step>
            <basescore>12</basescore>
            <parryat>@int(me::score/2)+3</parryat>
            <blockat>@int(me::score/2)+1</blockat>
          </calcs>
          <armordata />
          <ref>
            <mods>No Fine Manipulators Stat</mods>
            <mainwin>2</mainwin>
            <display>no</display>
            <disadat>-1</disadat>
          </ref>
          <modifiers count="1">
            <modifier idkey="10025">
              <name>No Fine Manipulators</name>
              <group>No Fine Manipulators Stat</group>
              <cost>-0%</cost>
              <formula>-@if(ST:No Fine Manipulators &gt; 0 &amp; owner::level &gt; 0 then 40 else 0)</formula>
              <forceformula>yes</forceformula>
              <level>1</level>
              <premodsvalue>+0%</premodsvalue>
              <value>+0%</value>
              <valuenum>0</valuenum>
              <page>B145</page>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Attributes" idkey="10026">
          <name>Encumbrance Penalty</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>char::enclevel</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <conditional>-1 to (SK:Climbing, SK:Stealth),-2 to SK:Swimming,-1 to (SK:Judo, SK:Karate, "SK:Main-Gauche", SK:Rapier, SK:Saber, SK:Smallsword) when "striking or parrying"</conditional>
            <display>No</display>
          </ref>
          <conditionals count="3">
            <bonus>
              <targetname>(sk:climbing, sk:stealth)</targetname>
              <targettype>Unknown</targettype>
              <affects>level</affects>
              <bonuspart>-1</bonuspart>
              <bonustype>1</bonustype>
              <fullbonustext>-1 to (SK:Climbing, SK:Stealth)</fullbonustext>
              <value>0</value>
            </bonus>
            <bonus>
              <targetprefix>SK</targetprefix>
              <targetname>swimming</targetname>
              <targettype>Skills</targettype>
              <affects>level</affects>
              <bonuspart>-2</bonuspart>
              <bonustype>1</bonustype>
              <fullbonustext>-2 to SK:Swimming</fullbonustext>
              <value>0</value>
            </bonus>
            <bonus>
              <targetname>(sk:judo, sk:karate, "sk:main-gauche", sk:rapier, sk:saber, sk:smallsword)</targetname>
              <targettype>Unknown</targettype>
              <affects>level</affects>
              <bonuspart>-1</bonuspart>
              <bonustype>1</bonustype>
              <fullbonustext>-1 to (SK:Judo, SK:Karate, "SK:Main-Gauche", SK:Rapier, SK:Saber, SK:Smallsword) when "striking or parrying"</fullbonustext>
              <value>0</value>
              <notes>striking or parrying</notes>
            </bonus>
          </conditionals>
        </trait>
        <trait type="Attributes" idkey="10027">
          <name>Enhanced Air Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Air Move::basescore - ST:Air Move::basescore to ST:Air Move</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>air move</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Air Move::basescore - ST:Air Move::basescore</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Air Move::basescore - ST:Air Move::basescore to ST:Air Move</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10028">
          <name>Enhanced Ground Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Ground Move::basescore - ST:Ground Move::basescore to ST:Ground Move</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>ground move</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Ground Move::basescore - ST:Ground Move::basescore</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Ground Move::basescore - ST:Ground Move::basescore to ST:Ground Move</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10029">
          <name>Enhanced Space Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Space Move::basescore - ST:Space Move::basescore to ST:Space Move</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>space move</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Space Move::basescore - ST:Space Move::basescore</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Space Move::basescore - ST:Space Move::basescore to ST:Space Move</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10030">
          <name>Enhanced Water Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Water Move::basescore - ST:Water Move::basescore to ST:Water Move</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>water move</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Water Move::basescore - ST:Water Move::basescore</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=@if( me::score = @int(me::score) then @power(2, me::score) else @power(2, @int(me::score)) * 1.5 ) * ST:Water Move::basescore - ST:Water Move::basescore to ST:Water Move</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10031">
          <name>Extra Arm Reach</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10032">
          <name>Extra Arm SM</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Size Modifier</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Extra Arm Reach</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>extra arm reach</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6))))))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Extra Arm Reach</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10033">
          <name>Fatigue Points</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>FP</symbol>
          <points>0</points>
          <score>12</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:HT</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>3</up>
            <down>-3</down>
            <step>1</step>
            <basescore>12</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>8</mainwin>
            <display>No</display>
            <disadat>-1</disadat>
          </ref>
          <attackmodes count="1">
            <attackmode>
              <name />
              <uses>=me::score</uses>
              <uses_sections>2</uses_sections>
              <uses_settings>backcolor(White),trackusesbysection(False),altbox(gold,=me::score - @if(me::score/3 = me::score\\3 then me::score\\3-1 else me::score\\3),red,count)</uses_settings>
              <uses_used>0+0</uses_used>
            </attackmode>
          </attackmodes>
        </trait>
        <trait type="Attributes" idkey="10034">
          <name>Fright Check</name>
          <bonuslist>+2 from 'Combat Reflexes'</bonuslist>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>12</score>
          <level>0</level>
          <calcs>
            <syslevels>2</syslevels>
            <basevalue>ST:Will</basevalue>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10035">
          <name>Ground Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>6</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Ground Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>6</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10036">
          <name>Hearing</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Perception</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10037">
          <name>Heavy Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>HEnc</symbol>
          <points>0</points>
          <score>120</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>6 * ST:Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>120</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10038">
          <name>Heavy Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>HEncMove</symbol>
          <points>0</points>
          <score>2</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@MAX(@if(ST:Ground Move = 0 THEN 0 ELSE 1), 0.4 * ST:Ground Move)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>2.4</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10039">
          <name>High Jump</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>26</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>(((6 * @max(ST:Basic Ground Move, SK:Jumping::level / 2)) - 10) * @if(ST:Metric = 1 THEN 2.5 ELSE 1)) * (2 ^ ST:Super Jump)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>26</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B352</page>
            <units>in | cm</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10040">
          <name>Hit Points</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>HP</symbol>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>2</up>
            <down>-2</down>
            <step>1</step>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <mods>Size HP</mods>
            <mainwin>5</mainwin>
            <display>no</display>
            <disadat>-1</disadat>
          </ref>
          <attackmodes count="1">
            <attackmode>
              <name />
              <uses>=me::score</uses>
              <uses_sections>6</uses_sections>
              <uses_settings>trackusesbysection(False),altbox(gold,=me::score - @if(me::score/3 = me::score\\3 then me::score\\3-1 else me::score\\3),red,count,blue,count+1, red, count*2,blue,count*2+1, red, count*3, blue, count*3+1,red,count*4,blue,count*4+1, red, count*5,blue,count*5+1, red,count*6)</uses_settings>
              <uses_used>0+0+0+0+0+0</uses_used>
            </attackmode>
          </attackmodes>
          <modifiers count="1">
            <modifier idkey="10041">
              <name>Size</name>
              <group>Size HP</group>
              <cost>-10%</cost>
              <formula>-@if(ST:Size Modifier::score &gt; 0 &amp; ST:Hit Points::level &gt; 0 THEN ST:Size Modifier::score * 10 else 0)</formula>
              <forceformula>yes</forceformula>
              <level>1</level>
              <premodsvalue>+0%</premodsvalue>
              <value>+0%</value>
              <valuenum>0</valuenum>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Attributes" idkey="10042">
          <name>HT</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>HT</symbol>
          <points>20</points>
          <score>12</score>
          <level>2</level>
          <calcs>
            <syslevels>0</syslevels>
            <basepoints>20</basepoints>
            <premodspoints>20</premodspoints>
            <basevalue>10</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>10</up>
            <down>-10</down>
            <step>1</step>
            <basescore>12</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>4</mainwin>
            <display>no</display>
            <disadat>-1</disadat>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10043">
          <name>IQ</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>IQ</symbol>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>10</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>20</up>
            <down>-20</down>
            <step>1</step>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>3</mainwin>
            <display>no</display>
            <disadat>-1</disadat>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10044">
          <name>Jump Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>6</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@max(ST:Ground Move, @round((ST:Broad Jump/15)+0.49999, 0))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>6</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10045">
          <name>Kick</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Striking ST</basevalue>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0) to me::skillscore$, =+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score)) to me::parryscore$</gives>
            <mods>Punch/Kick</mods>
            <display>no</display>
          </ref>
          <attackmodes count="1">
            <attackmode>
              <name>Kick</name>
              <damagebasedon>ST:Kick</damagebasedon>
              <reachbasedon>ST:Leg Reach</reachbasedon>
              <damage>thr+ @if("AD:Claws (Blunt Claws)::level" = 1 &amp; @itemhasmod(AD:Claws (Blunt Claws), Hands Only) = 0 then @basethdice(ST:Kick) else @if("AD:Claws (Long Talons)::level" = 1 &amp; @itemhasmod(AD:Claws (Long Talons), Hands Only) = 0 then @basethdice(ST:Kick) else @if("AD:Claws (Hooves)::level" = 1 then @basethdice(ST:Kick) else 0))) + @if("DI:Horizontal::level" = 1 then @if("AD:Claws (Blunt Claws)::level" = 1 then 0 else @if("AD:Claws (Sharp Claws)::level" = 1 then 0 else @if("AD:Claws (Talons)::level" = 1 then 0 else @if("AD:Claws (Long Talons)::level" = 1 then 0 else -@basethdice(ST:Kick))))) else 0) + @max(@if("SK:Brawling::level" &gt; ST:DX+1 then @basethdice(ST:Punch) ELSE 0),@if("SK:Karate::level" = ST:DX then @basethdice(ST:Punch) ELSE @if("SK:Karate::level" &gt; ST:DX then 2 * @basethdice(ST:Punch) ELSE 0)))</damage>
              <damtype>$if("AD:Claws (Sharp Claws)::level" = 1 &amp; @itemhasmod(AD:Claws (Sharp Claws), Hands Only) = 0 THEN "cut" ELSE $if("AD:Claws (Talons)::level" = 1 &amp; @itemhasmod(AD:Claws (Talons), Hands Only) = 0 THEN "cut/imp" ELSE $if("AD:Claws (Long Talons)::level" = 1 &amp; @itemhasmod(AD:Claws (Long Talons), Hands Only) = 0 THEN "cut/imp" ELSE "cr")))</damtype>
              <parry>No</parry>
              <reach>C,1</reach>
              <skillused>ST:DX-2, SK:Brawling-2, SK:Karate-2, SK:Kicking (Karate), SK:Kicking (Brawling)</skillused>
              <charparry>No</charparry>
              <chareffectivest>10</chareffectivest>
              <charskillscore>10</charskillscore>
              <charskillused>"ST:DX"-2</charskillused>
              <charparryscore>No</charparryscore>
              <charskillusedkey>k10024</charskillusedkey>
              <chardamage>1d-2</chardamage>
              <dmg>thr</dmg>
              <chardamtype>cr</chardamtype>
              <charreach>C,1</charreach>
              <itemnotes>{Brawling (p. B182) increases all unarmed damage; Claws (p. B42) and Karate (p. B203) improve damage with punches and kicks (Claws don't affect damage with brass knuckles or boots); and Boxing (p. B182) improves punching damage.}</itemnotes>
            </attackmode>
          </attackmodes>
          <bonuses count="2">
            <bonus>
              <targetname>me</targetname>
              <targettag>skillscore</targettag>
              <targettype>Me</targettype>
              <affects>otherstring</affects>
              <bonuspart>-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0)</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0) to me::skillscore$</fullbonustext>
              <value>1</value>
              <stringvalue>-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0)</stringvalue>
              <stringvaluetext>-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0)</stringvaluetext>
            </bonus>
            <bonus>
              <targetname>me</targetname>
              <targettag>parryscore</targettag>
              <targettype>Me</targettype>
              <affects>otherstring</affects>
              <bonuspart>+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score)) to me::parryscore$</fullbonustext>
              <value>1</value>
              <stringvalue>+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score))</stringvalue>
              <stringvaluetext>+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score))</stringvaluetext>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10046">
          <name>Leg Reach</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10047">
          <name>Leg SM</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Size Modifier</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Leg Reach</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>leg reach</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6))))))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Leg Reach</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10048">
          <name>Lifting ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>ST:ST</minscore>
            <up>3</up>
            <down>0</down>
            <step>1</step>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
          <modifiers count="1">
            <modifier idkey="10049">
              <name>Size</name>
              <group>Size</group>
              <cost>-10%</cost>
              <formula>-@if(ST:Size Modifier::score &gt; 0 &amp; ST:Lifting ST::level &gt; 0 THEN ST:Size Modifier::score * 10 else 0)</formula>
              <forceformula>yes</forceformula>
              <level>1</level>
              <premodsvalue>+0%</premodsvalue>
              <value>+0%</value>
              <valuenum>0</valuenum>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Attributes" idkey="10050">
          <name>Light Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>LEnc</symbol>
          <points>0</points>
          <score>40</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>2 * ST:Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>40</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10051">
          <name>Light Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>LEncMove</symbol>
          <points>0</points>
          <score>4</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@MAX(@if(ST:Ground Move = 0 THEN 0 ELSE 1), 0.8 * ST:Ground Move)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>4.8</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10052">
          <name>Magery</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=+me::score to ("CO:Air", "CO:Animal", "CO:Body Control", "CO:Communication &amp; Empathy", "CO:Earth", "CO:Enchantment", "CO:Fire", "CO:Food", "CO:Illusion &amp; Creation", "CO:Gate", "CO:Healing", "CO:Knowledge", "CO:Light &amp; Darkness", "CO:Making &amp; Breaking", "CO:Meta-Spells", "CO:Mind Control", "CO:Movement", "CO:Necromancy", "CO:Plant", "CO:Protection &amp; Warning", "CO:Sound", "CO:Technological", "CO:Water", "CO:Weather")</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetname>("co:air", "co:animal", "co:body control", "co:communication &amp; empathy", "co:earth", "co:enchantment", "co:fire", "co:food", "co:illusion &amp; creation", "co:gate", "co:healing", "co:knowledge", "co:light &amp; darkness", "co:making &amp; breaking", "co:meta-spells", "co:mind control", "co:movement", "co:necromancy", "co:plant", "co:protection &amp; warning", "co:sound", "co:technological", "co:water", "co:weather")</targetname>
              <targettype>Unknown</targettype>
              <affects>level</affects>
              <bonuspart>+me::score</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+me::score to ("CO:Air", "CO:Animal", "CO:Body Control", "CO:Communication &amp; Empathy", "CO:Earth", "CO:Enchantment", "CO:Fire", "CO:Food", "CO:Illusion &amp; Creation", "CO:Gate", "CO:Healing", "CO:Knowledge", "CO:Light &amp; Darkness", "CO:Making &amp; Breaking", "CO:Meta-Spells", "CO:Mind Control", "CO:Movement", "CO:Necromancy", "CO:Plant", "CO:Protection &amp; Warning", "CO:Sound", "CO:Technological", "CO:Water", "CO:Weather")</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10053">
          <name>Magery 0</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10054">
          <name>Magery Air</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10055">
          <name>Magery Animal</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10056">
          <name>Magery Body Control</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10057">
          <name>Magery Communication &amp; Empathy</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10058">
          <name>Magery Earth</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10059">
          <name>Magery Enchantment</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10060">
          <name>Magery Fire</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10061">
          <name>Magery Food</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10062">
          <name>Magery Gate</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10063">
          <name>Magery Healing</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10064">
          <name>Magery Illusion &amp; Creation</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10065">
          <name>Magery Knowledge</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10066">
          <name>Magery Light &amp; Darkness</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10067">
          <name>Magery Making &amp; Breaking</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10068">
          <name>Magery Meta-Spells</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10069">
          <name>Magery Mind Control</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10070">
          <name>Magery Movement</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10071">
          <name>Magery Necromancy</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10072">
          <name>Magery Plant</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10073">
          <name>Magery Protection &amp; Warning</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10074">
          <name>Magery Sound</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10075">
          <name>Magery Technological</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10076">
          <name>Magery Water</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10077">
          <name>Magery Weather</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Magery</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10078">
          <name>MageryBase</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>100</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10079">
          <name>Medium Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>MEnc</symbol>
          <points>0</points>
          <score>60</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>3 * ST:Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>60</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10080">
          <name>Medium Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>MEncMove</symbol>
          <points>0</points>
          <score>3</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@MAX(@if(ST:Ground Move = 0 THEN 0 ELSE 1), 0.6 * ST:Ground Move)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>3.6</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10081">
          <name>Metric</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1</maxscore>
            <minscore>0</minscore>
            <up>0</up>
            <down>0</down>
            <step>1</step>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>yes</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10082">
          <name>Money</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>-440</score>
          <level>1</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Money Base + (ST:Starting Wealth * @max(@if(@hasmod(5% of Starting Wealth) THEN 0.05),@if(@hasmod(10% of Starting Wealth) THEN 0.1),@if(@hasmod(15% of Starting Wealth) THEN 0.15),@if(@hasmod(20% of Starting Wealth) THEN 0.2),@if(@hasmod(30% of Starting Wealth) THEN 0.3),@if(@hasmod(40% of Starting Wealth) THEN 0.4),@if(@hasmod(50% of Starting Wealth) THEN 0.5),@if(@hasmod(60% of Starting Wealth) THEN 0.6),@if(@hasmod(70% of Starting Wealth) THEN 0.7),@if(@hasmod(80% of Starting Wealth) THEN 0.8),@if(@hasmod(90% of Starting Wealth) THEN 0.9),@if(@hasmod(100% of Starting Wealth) THEN 1) ) ) - char::equipmentcost</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <basescore>-440</basescore>
          </calcs>
          <armordata />
          <ref>
            <mods>Money</mods>
            <mainwin>15</mainwin>
            <display>No</display>
          </ref>
          <modifiers count="1">
            <modifier idkey="10083">
              <name>20% of Starting Wealth</name>
              <group>Initial</group>
              <cost>+0</cost>
              <level>1</level>
              <premodsvalue>+0</premodsvalue>
              <value>+0</value>
              <valuenum>0</valuenum>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Attributes" idkey="10084">
          <name>Money Base</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10085">
          <name>Monthly Pay</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>700</score>
          <level>4</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@indexedvalue(3 + AD:Wealth::level - DI:Wealth::level, 0.2, 0.5, 1, 2, 5, 20, 100, 1000, 10000, 100000, 1000000) * @indexedvalue(1 + ST:Tech Level::basevalue, 625, 650, 675, 700, 800, 1100, 1600, 2100, 2600, 3600, 5600, 8100, 10600)</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <round>1</round>
            <basescore>700</basescore>
          </calcs>
          <armordata />
          <ref>
            <description>The /typical/ Monthly Pay for a job of the character's selected Wealth Level and the campaign's set Tech Level, as calculated based on the tables on p. B516-517</description>
            <mainwin>17</mainwin>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10086">
          <name>Native Cultural Familiarities</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10087">
          <name>Native Languages</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10088">
          <name>Neck Reach</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10089">
          <name>Neck SM</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Size Modifier</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Neck Reach</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>neck reach</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6))))))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Neck Reach</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10090">
          <name>No Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>NEnc</symbol>
          <points>0</points>
          <score>20</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>20</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10091">
          <name>No Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>NEncMove</symbol>
          <points>0</points>
          <score>6</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@MAX(@if(ST:Ground Move = 0 THEN 0 ELSE 1), ST:Ground Move)</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>6</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10092">
          <name>No Fine Manipulators</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10093">
          <name>One Arm Lifting ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Lifting ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10094">
          <name>One Arm Reach</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10095">
          <name>One Arm SM</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Size Modifier</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:One Arm Reach</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>one arm reach</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6))))))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:One Arm Reach</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10096">
          <name>One Arm Striking ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Striking ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10097">
          <name>One-Handed Lift</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>40</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>2 * @if(ST:One Arm Lifting ST::score &lt;= 7 then ST:One Arm Lifting ST * ST:One Arm Lifting ST / @if(ST:Metric = 1 THEN 11 ELSE 5) else @int((ST:One Arm Lifting ST * ST:One Arm Lifting ST / @if(ST:Metric = 1 THEN 11 ELSE 5))+0.5))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>1</round>
            <basescore>40</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10098">
          <name>Parry</name>
          <bonuslist>+1 from 'Combat Reflexes'</bonuslist>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>1</score>
          <level>0</level>
          <calcs>
            <syslevels>1</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10099">
          <name>Perception</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>Per</symbol>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:IQ</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>5</up>
            <down>-5</down>
            <step>1</step>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>7</mainwin>
            <disadat>-1</disadat>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10100">
          <name>Punch</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:One Arm Striking ST</basevalue>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0) to me::skillscore$, =+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score)) to me::parryscore$</gives>
            <mods>Punch/Kick</mods>
            <display>no</display>
          </ref>
          <attackmodes count="1">
            <attackmode>
              <name>Punch</name>
              <damagebasedon>ST:Punch</damagebasedon>
              <reachbasedon>ST:One Arm Reach</reachbasedon>
              <damage>thr-1 + @if("AD:Claws (Blunt Claws)::level" = 1 &amp; @itemhasmod(AD:Claws (Blunt Claws), Feet Only) = 0 then @basethdice(ST:Punch) else @if("AD:Claws (Long Talons)::level" = 1 &amp; @itemhasmod(AD:Claws (Long Talons), Feet Only) = 0 then @basethdice(ST:Punch) else 0)) + @max(@if("SK:Brawling::level" &gt; ST:DX+1 then @basethdice(ST:Punch) ELSE 0),@if("SK:Boxing::level" = ST:DX+1 then @basethdice(ST:Punch) ELSE @if("SK:Boxing::level" &gt; ST:DX+1 then 2 * @basethdice(ST:Punch) ELSE 0)),@if("SK:Karate::level" = ST:DX then @basethdice(ST:Punch) ELSE @if("SK:Karate::level" &gt; ST:DX then 2 * @basethdice(ST:Punch) ELSE 0)))</damage>
              <damtype>$if("AD:Claws (Sharp Claws)::level" = 1 &amp; @itemhasmod(AD:Claws (Sharp Claws), Feet Only) = 0 THEN "cut" ELSE $if("AD:Claws (Talons)::level" = 1  &amp; @itemhasmod(AD:Claws (Talons), Feet Only) = 0 THEN "cut/imp" ELSE $if("AD:Claws (Long Talons)::level" = 1  &amp; @itemhasmod(AD:Claws (Long Talons), Feet Only) = 0 THEN "cut/imp" ELSE "cr")))</damtype>
              <parry>0</parry>
              <reach>C</reach>
              <skillused>ST:DX, SK:Brawling, SK:Boxing, SK:Karate</skillused>
              <charparry>0</charparry>
              <chareffectivest>10</chareffectivest>
              <charskillscore>12</charskillscore>
              <charskillused>"ST:DX"</charskillused>
              <charparryscore>10</charparryscore>
              <charskillusedkey>k10024</charskillusedkey>
              <chardamage>1d-3</chardamage>
              <dmg>thr</dmg>
              <chardamtype>cr</chardamtype>
              <charreach>C</charreach>
              <itemnotes>{Brawling (p. B182) increases all unarmed damage; Claws (p. B42) and Karate (p. B203) improve damage with punches and kicks (Claws don't affect damage with brass knuckles or boots); and Boxing (p. B182) improves punching damage.}</itemnotes>
            </attackmode>
          </attackmodes>
          <bonuses count="2">
            <bonus>
              <targetname>me</targetname>
              <targettag>skillscore</targettag>
              <targettype>Me</targettype>
              <affects>otherstring</affects>
              <bonuspart>-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0)</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0) to me::skillscore$</fullbonustext>
              <value>1</value>
              <stringvalue>-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0)</stringvalue>
              <stringvaluetext>-@textindexedvalue($modetag(charskillused), ("SK:Karate", ST:Encumbrance Penalty::score), ELSE 0)</stringvaluetext>
            </bonus>
            <bonus>
              <targetname>me</targetname>
              <targettag>parryscore</targettag>
              <targettype>Me</targettype>
              <affects>otherstring</affects>
              <bonuspart>+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score)) to me::parryscore$</fullbonustext>
              <value>1</value>
              <stringvalue>+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score))</stringvalue>
              <stringvaluetext>+(@textindexedvalue($modetag(charskillused), ("SK:Karate", 1), ELSE 0) * (@int(($modetag(charskillscore) + ST:Encumbrance Penalty::score)/2) - @int($modetag(charskillscore)/2) - ST:Encumbrance Penalty::score))</stringvaluetext>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10101">
          <name>Reaction</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10102">
          <name>Remaining Funds</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>360</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Starting Wealth - char::equipmentcost</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <basescore>360</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10103">
          <name>Shift Slightly</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>1000</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>50 * ST:Basic Lift</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>1000</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10104">
          <name>Shove/Knock Over</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>240</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>12 * ST:Basic Lift</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>240</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10105">
          <name>Signature Gear</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10106">
          <name>Size Modifier</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>SM</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>-100</minscore>
            <up>0</up>
            <down>0</down>
            <step>1</step>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>12</mainwin>
            <display>yes</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10107">
          <name>Space Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Space Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <up>2</up>
            <down>-2</down>
            <step>1</step>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10108">
          <name>ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>ST</symbol>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>10</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>10</up>
            <down>-10</down>
            <step>1</step>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <mods>No Fine Manipulators, Size</mods>
            <mainwin>1</mainwin>
            <display>no</display>
            <disadat>-1</disadat>
          </ref>
          <modifiers count="2">
            <modifier idkey="10110">
              <name>No Fine Manipulators</name>
              <group>No Fine Manipulators Stat</group>
              <cost>-40%</cost>
              <formula>-@if(ST:No Fine Manipulators &gt; 0 &amp; owner::level &gt; 0 then 40 else 0)</formula>
              <forceformula>yes</forceformula>
              <level>1</level>
              <premodsvalue>+0%</premodsvalue>
              <value>+0%</value>
              <valuenum>0</valuenum>
            </modifier>
            <modifier idkey="10109">
              <name>Size</name>
              <group>Size ST</group>
              <cost>-10%</cost>
              <formula>-@if(ST:Size Modifier::score &gt; 0 &amp; owner::score &gt; 0 THEN ST:Size Modifier::score * 10 else 0)</formula>
              <forceformula>yes</forceformula>
              <level>1</level>
              <premodsvalue>+0%</premodsvalue>
              <value>+0%</value>
              <valuenum>0</valuenum>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Attributes" idkey="10111">
          <name>Starting Wealth</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>1000</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Wealth Modifier * @indexedvalue(ST:Tech Level::basevalue + 1, 25, 50, 75, 100, 200, 500, 1000, 1500, 2000, 3000, 5000, 7500, 10000)</basevalue>
            <minscore>0</minscore>
            <step>0</step>
            <basescore>1000</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10112">
          <name>Status</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>8 limitingtotal</maxscore>
            <minscore>-2</minscore>
            <up>5</up>
            <down>-5</down>
            <step>1</step>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>16</mainwin>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10113">
          <name>Striking ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>ST:ST</minscore>
            <up>5</up>
            <down>0</down>
            <step>1</step>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
          <modifiers count="1">
            <modifier idkey="10114">
              <name>Size</name>
              <group>Size</group>
              <cost>-10%</cost>
              <formula>-@if(ST:Size Modifier::score &gt; 0 &amp; ST:Striking ST::level &gt; 0 THEN ST:Size Modifier::score * 10 else 0)</formula>
              <forceformula>yes</forceformula>
              <level>1</level>
              <premodsvalue>+0%</premodsvalue>
              <value>+0%</value>
              <valuenum>0</valuenum>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Attributes" idkey="10115">
          <name>Super Jump</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10116">
          <name>Taste/Smell</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Perception</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10117">
          <name>Tech Level</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TL</symbol>
          <points>0</points>
          <score>3</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>3</basevalue>
            <maxscore>12</maxscore>
            <minscore>0</minscore>
            <up>5</up>
            <down>-5</down>
            <step>1</step>
            <round>1</round>
            <basescore>3</basescore>
          </calcs>
          <armordata />
          <ref>
            <mods>Tech Level</mods>
            <mainwin>14</mainwin>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10118">
          <name>Three Arm Lifting ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if(AD:Extra Arms &gt; 0 THEN ST:Lifting ST ELSE 0)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10119">
          <name>Three Arm Striking ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@if(AD:Extra Arms &gt; 0 THEN ST:Striking ST ELSE 0)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10120">
          <name>TK Basic Lift</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TK BL</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:TK ST * ST:TK ST / @if(ST:Metric = 1 THEN 11 ELSE 5)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>@if(ST:TK ST::score &lt;= 7 then 0 else 1)</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <units>lb | kg</units>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10121">
          <name>TK Heavy Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKHEnc</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>6 * ST:TK Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10122">
          <name>TK Heavy Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKHEncMove</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0.4 * ST:TK Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10123">
          <name>TK Light Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKLEnc</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>2 * ST:TK Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10124">
          <name>TK Light Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKLEncMove</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0.8 * ST:TK Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10125">
          <name>TK Max Lift</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TK ML</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>8 * "ST:TK Basic Lift"</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <units>lb | kg</units>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10126">
          <name>TK Medium Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKMEnc</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>3 * ST:TK Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10127">
          <name>TK Medium Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKMEncMove</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0.6 * ST:TK Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10128">
          <name>TK Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10129">
          <name>TK No Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKNEnc</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:TK Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10130">
          <name>TK No Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKNEncMove</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:TK Move</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10131">
          <name>TK Shift Slightly</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>50 * ST:TK Basic Lift</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10132">
          <name>TK Shove/Knock Over</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>12 * ST:TK Basic Lift</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10133">
          <name>TK ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10134">
          <name>TK X-Heavy Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKXEnc</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>10 * ST:TK Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10135">
          <name>TK X-Heavy Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>TKXEncMove</symbol>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0.2 * ST:TK Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10136">
          <name>Touch</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Perception</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10137">
          <name>Tunneling Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <hide>yes</hide>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@itemhasmod(AD:Tunneling, Tunneling Move)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10138">
          <name>Two Arm Lifting ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Lifting ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10139">
          <name>Two Arm Reach</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10140">
          <name>Two Arm SM</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Size Modifier</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <gives>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Two Arm Reach</gives>
            <display>no</display>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetprefix>ST</targetprefix>
              <targetname>two arm reach</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6))))))</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+@if(me::score &lt; 1 THEN 0 ELSE @if(me::score = 1 THEN 0.5 ELSE @if(me::score = 2 THEN 1 ELSE (@indexedvalue((me::score- (6 * @int(me::score / 6))) + 1, 0.7,1,1.5,2,3,5) * (10 ^ @int(me::score / 6)))))) to ST:Two Arm Reach</fullbonustext>
              <value>0</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Attributes" idkey="10141">
          <name>Two Arm Striking ST</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Striking ST</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10142">
          <name>Two-Handed Lift</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>160</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>8 * @if(ST:Two Arm Lifting ST::score &lt;= 7 then ST:Two Arm Lifting ST * ST:Two Arm Lifting ST / @if(ST:Metric = 1 THEN 11 ELSE 5) else @int((ST:Two Arm Lifting ST * ST:Two Arm Lifting ST / @if(ST:Metric = 1 THEN 11 ELSE 5))+0.5))</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>1</round>
            <basescore>160</basescore>
          </calcs>
          <armordata />
          <ref>
            <page>B353</page>
            <units>lb | kg</units>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10143">
          <name>Unappealing</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>0</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>0</basevalue>
            <basescore>0</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>no</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10144">
          <name>Vision</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Perception</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10145">
          <name>Water Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>1</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:Basic Water Move</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <up>5</up>
            <down>-5</down>
            <step>1</step>
            <round>-1</round>
            <basescore>1</basescore>
          </calcs>
          <armordata />
          <ref />
        </trait>
        <trait type="Attributes" idkey="10146">
          <name>Wealth Modifier</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>10</basevalue>
            <minscore>0</minscore>
            <step>1</step>
            <round>-1</round>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10147">
          <name>Will</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <points>0</points>
          <score>10</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>ST:IQ</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0 - me::syslevels</minscore>
            <up>5</up>
            <down>-5</down>
            <step>1</step>
            <basescore>10</basescore>
          </calcs>
          <armordata />
          <ref>
            <mainwin>6</mainwin>
            <disadat>-1</disadat>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10148">
          <name>X-Heavy Encumbrance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>XEnc</symbol>
          <points>0</points>
          <score>200</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>10 * ST:Basic Lift</basevalue>
            <maxscore>10000000</maxscore>
            <minscore>0</minscore>
            <round>0</round>
            <basescore>200</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
        <trait type="Attributes" idkey="10149">
          <name>X-Heavy Encumbrance Move</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <symbol>XEncMove</symbol>
          <points>0</points>
          <score>1</score>
          <level>0</level>
          <calcs>
            <syslevels>0</syslevels>
            <basevalue>@MAX(@if(ST:Ground Move = 0 THEN 0 ELSE 1), 0.2 * ST:Ground Move)</basevalue>
            <maxscore>1000000</maxscore>
            <minscore>0</minscore>
            <round>-1</round>
            <basescore>1.2</basescore>
          </calcs>
          <armordata />
          <ref>
            <display>No</display>
          </ref>
        </trait>
      </attributes>
      <languages count="0" />
      <cultures count="0" />
      <advantages count="9">
        <trait type="Advantages" idkey="10151">
          <name>Combat Reflexes</name>
          <childkeylist>k10152</childkeylist>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Mundane, Mental, Mundane Mental</cat>
          <points>17</points>
          <level>1</level>
          <calcs>
            <cost>15/45</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
            <premodspoints>15</premodspoints>
            <childpoints>2</childpoints>
            <upto>2</upto>
            <levelnames>,Enhanced Time Sense</levelnames>
          </calcs>
          <armordata />
          <ref>
            <page>B43</page>
            <gives>=+1 To GR:Combat Reflexes, =+2 To Fright Check</gives>
            <taboo>DI:Combat Paralysis, AD:Enhanced Time Sense</taboo>
            <isparent>yes</isparent>
          </ref>
          <bonuses count="2">
            <bonus>
              <targetprefix>GR</targetprefix>
              <targetname>combat reflexes</targetname>
              <targettype>Unknown</targettype>
              <affects>level</affects>
              <bonuspart>+1</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+1 To GR:Combat Reflexes</fullbonustext>
              <value>1</value>
            </bonus>
            <bonus>
              <targetname>fright check</targetname>
              <targettype>Attributes</targettype>
              <affects>level</affects>
              <bonuspart>+2</bonuspart>
              <bonustype>3</bonustype>
              <fullbonustext>=+2 To Fright Check</fullbonustext>
              <value>2</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Advantages" idkey="10201">
          <name>Damage Resistance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>45</points>
          <level>9</level>
          <hide>yes</hide>
          <calcs>
            <cost>5/10</cost>
            <syslevels>0</syslevels>
            <baselevel>9</baselevel>
            <premodspoints>45</premodspoints>
          </calcs>
          <armordata>
            <dr>0</dr>
            <chardr>9</chardr>
            <location>skin</location>
            <charlocation>skin</charlocation>
            <locationcoverage>skin</locationcoverage>
          </armordata>
          <ref>
            <page>B46</page>
            <gives>+1 to me::dr</gives>
            <mods>Damage Resistance, Damage Resistance Partial, Limited Defense</mods>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
          <bonuses count="1">
            <bonus>
              <targetname>me</targetname>
              <targettag>dr</targettag>
              <targettype>Me</targettype>
              <affects>other</affects>
              <bonuspart>+1</bonuspart>
              <bonustype>1</bonustype>
              <fullbonustext>+1 to me::dr</fullbonustext>
              <value>9</value>
            </bonus>
          </bonuses>
        </trait>
        <trait type="Advantages" idkey="10200">
          <name>Doesn't Breathe</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>20</points>
          <level>1</level>
          <hide>yes</hide>
          <calcs>
            <cost>20</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
            <premodspoints>20</premodspoints>
          </calcs>
          <armordata />
          <ref>
            <page>B49</page>
            <taboo>AD:Filter Lungs</taboo>
            <mods>Doesn't Breathe</mods>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
        </trait>
        <trait type="Advantages" idkey="10199">
          <name>Immunity to Metabolic Hazards</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>30</points>
          <level>1</level>
          <hide>yes</hide>
          <calcs>
            <cost>30</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
            <premodspoints>30</premodspoints>
          </calcs>
          <armordata />
          <ref>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
        </trait>
        <trait type="Advantages" idkey="10202">
          <name>Injury Tolerance</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>45</points>
          <level>1</level>
          <hide>yes</hide>
          <calcs>
            <cost>0</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
          </calcs>
          <armordata />
          <ref>
            <page>B60</page>
            <mods>Injury Tolerance</mods>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
          <modifiers count="2">
            <modifier idkey="10203">
              <name>Homogenous</name>
              <group>Injury Tolerance</group>
              <cost>+40</cost>
              <level>1</level>
              <premodsvalue>+40</premodsvalue>
              <value>+40</value>
              <valuenum>40</valuenum>
            </modifier>
            <modifier idkey="10204">
              <name>No Blood</name>
              <group>Injury Tolerance</group>
              <cost>+5</cost>
              <level>1</level>
              <premodsvalue>+5</premodsvalue>
              <value>+5</value>
              <valuenum>5</valuenum>
            </modifier>
          </modifiers>
        </trait>
        <trait type="Advantages" idkey="10205">
          <name>Pressure Support</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>15</points>
          <level>3</level>
          <hide>yes</hide>
          <calcs>
            <cost>5/10</cost>
            <syslevels>0</syslevels>
            <baselevel>3</baselevel>
            <premodspoints>15</premodspoints>
            <upto>3</upto>
          </calcs>
          <armordata />
          <ref>
            <page>B77</page>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
        </trait>
        <trait type="Advantages" idkey="10206">
          <name>Sealed</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>15</points>
          <level>1</level>
          <hide>yes</hide>
          <calcs>
            <cost>15</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
            <premodspoints>15</premodspoints>
          </calcs>
          <armordata />
          <ref>
            <page>B82</page>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
        </trait>
        <trait type="Advantages" idkey="10152">
          <name>Teeth</name>
          <nameext>Fangs</nameext>
          <parentkey>k10151</parentkey>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Natural Attacks, Exotic Physical</cat>
          <points>2</points>
          <level>1</level>
          <calcs>
            <cost>2</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
            <premodspoints>2</premodspoints>
          </calcs>
          <armordata />
          <ref>
            <page>B91</page>
            <taboo>"AD:Teeth (Blunt Teeth)", "AD:Teeth (Sharp Teeth)", "AD:Teeth (Sharp Beak)"</taboo>
          </ref>
        </trait>
        <trait type="Advantages" idkey="10207">
          <name>Vacuum Support</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Exotic, Physical, Exotic Physical</cat>
          <points>5</points>
          <level>1</level>
          <hide>yes</hide>
          <calcs>
            <cost>5</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
            <premodspoints>5</premodspoints>
          </calcs>
          <armordata />
          <ref>
            <page>B96</page>
            <keep>10198</keep>
            <owned>yes</owned>
            <locked>yes</locked>
          </ref>
        </trait>
      </advantages>
      <perks count="0" />
      <disadvantages count="0" />
      <quirks count="0" />
      <features count="0" />
      <skills count="4">
        <trait type="Skills" idkey="10183">
          <name>Armoury</name>
          <nameext>Melee Weapons</nameext>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>_General, Military, Repair/Maintenance</cat>
          <tl>3</tl>
          <points>1</points>
          <type>IQ/A</type>
          <step>-1</step>
          <stepoff>IQ</stepoff>
          <level>9</level>
          <calcs>
            <sd>0</sd>
            <deflevel>0</deflevel>
            <pointmult>1</pointmult>
            <levelmult>1</levelmult>
            <syslevels>0</syslevels>
            <extralevels>0</extralevels>
            <baselevel>9</baselevel>
            <basepoints>1</basepoints>
            <multpoints>1</multpoints>
            <apppoints>1</apppoints>
            <premodspoints>1</premodspoints>
            <baseapppoints>1</baseapppoints>
          </calcs>
          <armordata />
          <ref>
            <page>B178</page>
            <default>IQ - 5, SK:Armoury - me::default0, "SK:Armoury (Battlesuits)" - 4, "SK:Armoury (Small Arms)" - 4, "SK:Armoury (Heavy Weapons)" - 4, "SK:Armoury (Missile Weapons)" - 4, "SK:Engineer (Melee Weapons)" - 4, "SK:Smith (Copper)" - me::default1, "SK:Smith (Iron)" - me::default2, SK:Machinist - me::default3</default>
          </ref>
          <extended count="4">
            <extendedtag>
              <tagname>default0</tagname>
              <tagvalue>@if(me::tl &gt; 4 THEN 100 ELSE 4)</tagvalue>
            </extendedtag>
            <extendedtag>
              <tagname>default1</tagname>
              <tagvalue>@if(me::tl =1 THEN 3 ELSE 100)</tagvalue>
            </extendedtag>
            <extendedtag>
              <tagname>default2</tagname>
              <tagvalue>@if(me::tl = 2 then 3 else @if(me::tl = 3 then 3 else @if(me::tl = 4 then 3 else 100)))</tagvalue>
            </extendedtag>
            <extendedtag>
              <tagname>default3</tagname>
              <tagvalue>@if(me::tl &gt; 4 then 3 else 100)</tagvalue>
            </extendedtag>
          </extended>
        </trait>
        <trait type="Skills" idkey="10185">
          <name>Jitte/Sai</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>_General, Combat/Weapons - Melee Combat</cat>
          <points>8</points>
          <type>DX/A</type>
          <step>+2</step>
          <stepoff>DX</stepoff>
          <level>14</level>
          <parrylevel>11</parrylevel>
          <calcs>
            <sd>0</sd>
            <deflevel>0</deflevel>
            <pointmult>1</pointmult>
            <levelmult>1</levelmult>
            <syslevels>0</syslevels>
            <extralevels>0</extralevels>
            <baselevel>14</baselevel>
            <basepoints>8</basepoints>
            <multpoints>8</multpoints>
            <apppoints>8</apppoints>
            <premodspoints>8</premodspoints>
            <baseapppoints>8</baseapppoints>
            <parryat>@int(%level/2)+3</parryat>
          </calcs>
          <armordata />
          <ref>
            <page>B208</page>
            <default>DX - 5, SK:Force Sword - 4, "SK:Main-Gauche" - 4, SK:Shortsword - 3, "SK:Jitte/Sai Art" - 3, "SK:Jitte/Sai Sport" - 3, SK:Sword!</default>
          </ref>
        </trait>
        <trait type="Skills" idkey="10184">
          <name>Shield</name>
          <nameext>Shield</nameext>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>_General, Combat/Weapons - Melee Combat</cat>
          <points>4</points>
          <type>DX/E</type>
          <step>+2</step>
          <stepoff>DX</stepoff>
          <level>14</level>
          <blocklevel>11</blocklevel>
          <calcs>
            <sd>0</sd>
            <deflevel>0</deflevel>
            <pointmult>1</pointmult>
            <levelmult>1</levelmult>
            <syslevels>0</syslevels>
            <extralevels>0</extralevels>
            <baselevel>14</baselevel>
            <basepoints>4</basepoints>
            <multpoints>4</multpoints>
            <apppoints>4</apppoints>
            <premodspoints>4</premodspoints>
            <baseapppoints>4</baseapppoints>
            <blockat>@int(%level/2)+3</blockat>
          </calcs>
          <armordata />
          <ref>
            <page>B220</page>
            <default>DX - 4, "SK:Shield (Buckler)" - 2, "SK:Shield (Force)" - 2, "SK:Shield Art (Shield)" - 3, "SK:Shield Sport (Shield)" - 3</default>
          </ref>
        </trait>
        <trait type="Skills" idkey="10186">
          <name>Staff</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>_General, Combat/Weapons - Melee Combat</cat>
          <points>8</points>
          <type>DX/A</type>
          <step>+2</step>
          <stepoff>DX</stepoff>
          <level>14</level>
          <parrylevel>13</parrylevel>
          <calcs>
            <sd>0</sd>
            <deflevel>0</deflevel>
            <pointmult>1</pointmult>
            <levelmult>1</levelmult>
            <syslevels>0</syslevels>
            <extralevels>0</extralevels>
            <baselevel>14</baselevel>
            <basepoints>8</basepoints>
            <multpoints>8</multpoints>
            <apppoints>8</apppoints>
            <premodspoints>8</premodspoints>
            <baseapppoints>8</baseapppoints>
            <parryat>@int(%level/2)+3+2</parryat>
          </calcs>
          <armordata />
          <ref>
            <page>B208</page>
            <default>DX - 5, SK:Polearm - 4, SK:Spear - 2, SK:Staff Art - 3, SK:Staff Sport - 3</default>
          </ref>
        </trait>
      </skills>
      <spells count="0" />
      <equipment count="1">
        <trait type="Equipment" idkey="10208">
          <name>Auto Pistol, .40</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Basic Set, Basic Set - Firearms, Basic Set - Firearms - Pistols &amp; SMGs, _Firearms, _Firearms - High-Tech</cat>
          <cost>640</cost>
          <count>1</count>
          <weight>2.1</weight>
          <level>0</level>
          <calcs>
            <basecost>640</basecost>
            <baseweight>2.1</baseweight>
            <precountcost>640</precountcost>
            <precountweight>2.1</precountweight>
            <premodscost>640</premodscost>
            <preformulacost>640</preformulacost>
            <preformulaweight>2.1</preformulaweight>
            <postformulacost>640</postformulacost>
            <postformulaweight>2.1</postformulaweight>
            <prechildrencost>640</prechildrencost>
            <prechildrenweight>2.1</prechildrenweight>
          </calcs>
          <armordata />
          <ref>
            <page>B278</page>
            <description>TL:8 LC:3 Damage:2d pi+ Acc:2 Range:150/1900 RoF:3 Shots:15+1(3) ST:9 Bulk:-2 Rcl:2 Skill:Guns (Pistol)</description>
            <mods>Equipment, Guns</mods>
            <techlvl>8</techlvl>
            <charunits>lb</charunits>
          </ref>
          <attackmodes count="1">
            <attackmode>
              <name />
              <lc>3</lc>
              <acc>2</acc>
              <damage>2d</damage>
              <damtype>pi+</damtype>
              <minst>9</minst>
              <rangehalfdam>150</rangehalfdam>
              <rangemax>1900</rangemax>
              <rcl>2</rcl>
              <rof>3</rof>
              <shots>15+1(3)</shots>
              <skillused>SK:Gun!, SK:Guns (Pistol), ST:DX-4, SK:Guns (Grenade Launcher)-4, SK:Guns (Gyroc)-4, SK:Guns (Light Anti-Armor Weapon)-4, SK:Guns (Light Machine Gun)- 2, SK:Guns (Musket)-2, SK:Guns (Pistol)-2, SK:Guns (Rifle)-2, SK:Guns (Shotgun)-2, SK:Guns (Submachine Gun)-2</skillused>
              <bulk>-2</bulk>
              <uses>16</uses>
              <malf>17</malf>
              <chareffectivest>10</chareffectivest>
              <charminst>9</charminst>
              <charskillscore>8</charskillscore>
              <charskillused>"ST:DX"-4</charskillused>
              <charskillusedkey>k10024</charskillusedkey>
              <chardamage>2d</chardamage>
              <dmg>2</dmg>
              <chardamtype>pi+</chardamtype>
              <charrangehalfdam>150</charrangehalfdam>
              <charrangemax>1900</charrangemax>
              <characc>2</characc>
              <charshots>15+1(3)</charshots>
              <charmalf>17</charmalf>
              <charbulk>-2</charbulk>
              <charrof>3</charrof>
              <charrcl>2</charrcl>
              <uses_used>0</uses_used>
            </attackmode>
          </attackmodes>
        </trait>
      </equipment>
      <templates count="1">
        <trait type="Templates" idkey="10198">
          <name>Body of Metal</name>
          <needscheck>-1</needscheck>
          <taboofailed>0</taboofailed>
          <cat>Meta-Traits, Meta-Traits - Elemental</cat>
          <points>175</points>
          <level>1</level>
          <calcs>
            <cost>0</cost>
            <syslevels>0</syslevels>
            <baselevel>1</baselevel>
          </calcs>
          <armordata />
          <ref>
            <page>B262</page>
            <description>Your body is made of metal.</description>
            <needs>{AD:Immunity to Metabolic Hazards}, {AD:Doesn't Breathe}, {AD:Damage Resistance}=9, {AD:Injury Tolerance}, {AD:Pressure Support}=3, {AD:Sealed}, {AD:Vacuum Support}</needs>
            <owns>yes</owns>
            <pkids>10199, 10200, 10201, 10202, 10205, 10206, 10207</pkids>
            <highlight>magenta</highlight>
            <collapse>yes</collapse>
            <isparent>yes</isparent>
            <noresync>yes</noresync>
          </ref>
        </trait>
      </templates>
    </traits>
    <loadouts count="0" />
    <transforms count="0" />
    <campaign>
      <name />
      <basetl>3</basetl>
      <basepoints>150</basepoints>
      <disadlimit>-75</disadlimit>
      <quirklimit>-5</quirklimit>
      <hasdisadlimit>-1</hasdisadlimit>
      <hasquirklimit>-1</hasquirklimit>
      <loggedpoints>0</loggedpoints>
      <otherpoints>0</otherpoints>
      <totalpoints>0</totalpoints>
      <loggedmoney>0</loggedmoney>
      <othermoney>0</othermoney>
      <totalmoney>0</totalmoney>
      <logentries count="1">
        <logentry>
          <entrydate>31/08/2022</entrydate>
          <campaigndate />
          <charpoints>0</charpoints>
          <charmoney>0</charmoney>
          <caption>Initial Character Creation</caption>
          <notes>Character created using GURPS Character Assistant (GCA5Engine, Version=5.0.189.0)</notes>
        </logentry>
      </logentries>
    </campaign>
    <basicdamages count="53">
      <basicdamage>
        <st>1</st>
        <thbase>1</thbase>
        <thadd>-6</thadd>
        <swbase>1</swbase>
        <swadd>-5</swadd>
      </basicdamage>
      <basicdamage>
        <st>2</st>
        <thbase>1</thbase>
        <thadd>-6</thadd>
        <swbase>1</swbase>
        <swadd>-5</swadd>
      </basicdamage>
      <basicdamage>
        <st>3</st>
        <thbase>1</thbase>
        <thadd>-5</thadd>
        <swbase>1</swbase>
        <swadd>-4</swadd>
      </basicdamage>
      <basicdamage>
        <st>4</st>
        <thbase>1</thbase>
        <thadd>-5</thadd>
        <swbase>1</swbase>
        <swadd>-4</swadd>
      </basicdamage>
      <basicdamage>
        <st>5</st>
        <thbase>1</thbase>
        <thadd>-4</thadd>
        <swbase>1</swbase>
        <swadd>-3</swadd>
      </basicdamage>
      <basicdamage>
        <st>6</st>
        <thbase>1</thbase>
        <thadd>-4</thadd>
        <swbase>1</swbase>
        <swadd>-3</swadd>
      </basicdamage>
      <basicdamage>
        <st>7</st>
        <thbase>1</thbase>
        <thadd>-3</thadd>
        <swbase>1</swbase>
        <swadd>-2</swadd>
      </basicdamage>
      <basicdamage>
        <st>8</st>
        <thbase>1</thbase>
        <thadd>-3</thadd>
        <swbase>1</swbase>
        <swadd>-2</swadd>
      </basicdamage>
      <basicdamage>
        <st>9</st>
        <thbase>1</thbase>
        <thadd>-2</thadd>
        <swbase>1</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>10</st>
        <thbase>1</thbase>
        <thadd>-2</thadd>
        <swbase>1</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>11</st>
        <thbase>1</thbase>
        <thadd>-1</thadd>
        <swbase>1</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>12</st>
        <thbase>1</thbase>
        <thadd>-1</thadd>
        <swbase>1</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>13</st>
        <thbase>1</thbase>
        <thadd>0</thadd>
        <swbase>2</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>14</st>
        <thbase>1</thbase>
        <thadd>0</thadd>
        <swbase>2</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>15</st>
        <thbase>1</thbase>
        <thadd>+1</thadd>
        <swbase>2</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>16</st>
        <thbase>1</thbase>
        <thadd>+1</thadd>
        <swbase>2</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>17</st>
        <thbase>1</thbase>
        <thadd>+2</thadd>
        <swbase>3</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>18</st>
        <thbase>1</thbase>
        <thadd>+2</thadd>
        <swbase>3</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>19</st>
        <thbase>2</thbase>
        <thadd>-1</thadd>
        <swbase>3</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>20</st>
        <thbase>2</thbase>
        <thadd>-1</thadd>
        <swbase>3</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>21</st>
        <thbase>2</thbase>
        <thadd>0</thadd>
        <swbase>4</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>22</st>
        <thbase>2</thbase>
        <thadd>0</thadd>
        <swbase>4</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>23</st>
        <thbase>2</thbase>
        <thadd>+1</thadd>
        <swbase>4</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>24</st>
        <thbase>2</thbase>
        <thadd>+1</thadd>
        <swbase>4</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>25</st>
        <thbase>2</thbase>
        <thadd>+2</thadd>
        <swbase>5</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>26</st>
        <thbase>2</thbase>
        <thadd>+2</thadd>
        <swbase>5</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>27</st>
        <thbase>3</thbase>
        <thadd>-1</thadd>
        <swbase>5</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>28</st>
        <thbase>3</thbase>
        <thadd>-1</thadd>
        <swbase>5</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>29</st>
        <thbase>3</thbase>
        <thadd>0</thadd>
        <swbase>5</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>30</st>
        <thbase>3</thbase>
        <thadd>0</thadd>
        <swbase>5</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>31</st>
        <thbase>3</thbase>
        <thadd>+1</thadd>
        <swbase>6</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>32</st>
        <thbase>3</thbase>
        <thadd>+1</thadd>
        <swbase>6</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>33</st>
        <thbase>3</thbase>
        <thadd>+2</thadd>
        <swbase>6</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>34</st>
        <thbase>3</thbase>
        <thadd>+2</thadd>
        <swbase>6</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>35</st>
        <thbase>4</thbase>
        <thadd>-1</thadd>
        <swbase>6</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>36</st>
        <thbase>4</thbase>
        <thadd>-1</thadd>
        <swbase>6</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>37</st>
        <thbase>4</thbase>
        <thadd>0</thadd>
        <swbase>6</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>38</st>
        <thbase>4</thbase>
        <thadd>0</thadd>
        <swbase>6</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>39</st>
        <thbase>4</thbase>
        <thadd>+1</thadd>
        <swbase>7</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>40</st>
        <thbase>4</thbase>
        <thadd>+1</thadd>
        <swbase>7</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>45</st>
        <thbase>5</thbase>
        <thadd>0</thadd>
        <swbase>7</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>50</st>
        <thbase>5</thbase>
        <thadd>+2</thadd>
        <swbase>8</swbase>
        <swadd>-1</swadd>
      </basicdamage>
      <basicdamage>
        <st>55</st>
        <thbase>6</thbase>
        <thadd>0</thadd>
        <swbase>8</swbase>
        <swadd>+1</swadd>
      </basicdamage>
      <basicdamage>
        <st>60</st>
        <thbase>7</thbase>
        <thadd>-1</thadd>
        <swbase>9</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>65</st>
        <thbase>7</thbase>
        <thadd>+1</thadd>
        <swbase>9</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>70</st>
        <thbase>8</thbase>
        <thadd>0</thadd>
        <swbase>10</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>75</st>
        <thbase>8</thbase>
        <thadd>+2</thadd>
        <swbase>10</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>80</st>
        <thbase>9</thbase>
        <thadd>0</thadd>
        <swbase>11</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>85</st>
        <thbase>9</thbase>
        <thadd>+2</thadd>
        <swbase>11</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>90</st>
        <thbase>10</thbase>
        <thadd>0</thadd>
        <swbase>12</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>95</st>
        <thbase>10</thbase>
        <thadd>+2</thadd>
        <swbase>12</swbase>
        <swadd>+2</swadd>
      </basicdamage>
      <basicdamage>
        <st>100</st>
        <thbase>11</thbase>
        <thadd>0</thadd>
        <swbase>13</swbase>
        <swadd>0</swadd>
      </basicdamage>
      <basicdamage>
        <st>0</st>
        <thbase>(@int(ST:Striking ST/10)+1)</thbase>
        <thadd>0</thadd>
        <swbase>(@int(ST:Striking ST/10)+3)</swbase>
        <swadd>0</swadd>
      </basicdamage>
    </basicdamages>
    <damagebreaks count="2">
      <damagebreak>
        <break>7</break>
        <adddice>2</adddice>
        <subtract>7</subtract>
      </damagebreak>
      <damagebreak>
        <break>4</break>
        <adddice>1</adddice>
        <subtract>4</subtract>
      </damagebreak>
    </damagebreaks>
    <skilltypes count="31">
      <skilltype>
        <name>N/A</name>
        <costs>0/1</costs>
        <baseadj>0</baseadj>
        <adds>1</adds>
        <defaultstat>0</defaultstat>
        <relname />
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>N | A</name>
        <costs>0/1</costs>
        <baseadj>0</baseadj>
        <adds>1</adds>
        <defaultstat>%default</defaultstat>
        <relname>def</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>-1</subzero>
      </skilltype>
      <skilltype>
        <name>DX/E</name>
        <costs>1/2/4/8</costs>
        <baseadj>-1</baseadj>
        <adds>1</adds>
        <defaultstat>ST:DX</defaultstat>
        <relname>DX</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>DX/A</name>
        <costs>1/2/4/8</costs>
        <baseadj>-2</baseadj>
        <adds>1</adds>
        <defaultstat>ST:DX</defaultstat>
        <relname>DX</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>DX/H</name>
        <costs>1/2/4/8</costs>
        <baseadj>-3</baseadj>
        <adds>1</adds>
        <defaultstat>ST:DX</defaultstat>
        <relname>DX</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>DX/VH</name>
        <costs>1/2/4/8</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:DX</defaultstat>
        <relname>DX</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>DX/WC</name>
        <costs>3/6/12/24</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:DX</defaultstat>
        <relname>DX</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>IQ/E</name>
        <costs>1/2/4/8</costs>
        <baseadj>-1</baseadj>
        <adds>1</adds>
        <defaultstat>ST:IQ</defaultstat>
        <relname>IQ</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>IQ/A</name>
        <costs>1/2/4/8</costs>
        <baseadj>-2</baseadj>
        <adds>1</adds>
        <defaultstat>ST:IQ</defaultstat>
        <relname>IQ</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>IQ/H</name>
        <costs>1/2/4/8</costs>
        <baseadj>-3</baseadj>
        <adds>1</adds>
        <defaultstat>ST:IQ</defaultstat>
        <relname>IQ</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>IQ/VH</name>
        <costs>1/2/4/8</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:IQ</defaultstat>
        <relname>IQ</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>IQ/WC</name>
        <costs>3/6/12/24</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:IQ</defaultstat>
        <relname>IQ</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>HT/E</name>
        <costs>1/2/4/8</costs>
        <baseadj>-1</baseadj>
        <adds>1</adds>
        <defaultstat>ST:HT</defaultstat>
        <relname>HT</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>HT/A</name>
        <costs>1/2/4/8</costs>
        <baseadj>-2</baseadj>
        <adds>1</adds>
        <defaultstat>ST:HT</defaultstat>
        <relname>HT</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>HT/H</name>
        <costs>1/2/4/8</costs>
        <baseadj>-3</baseadj>
        <adds>1</adds>
        <defaultstat>ST:HT</defaultstat>
        <relname>HT</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>HT/VH</name>
        <costs>1/2/4/8</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:HT</defaultstat>
        <relname>HT</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>HT/WC</name>
        <costs>3/6/12/24</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:HT</defaultstat>
        <relname>HT</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Will/E</name>
        <costs>1/2/4/8</costs>
        <baseadj>-1</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Will</defaultstat>
        <relname>Will</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Will/A</name>
        <costs>1/2/4/8</costs>
        <baseadj>-2</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Will</defaultstat>
        <relname>Will</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Will/H</name>
        <costs>1/2/4/8</costs>
        <baseadj>-3</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Will</defaultstat>
        <relname>Will</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Will/VH</name>
        <costs>1/2/4/8</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Will</defaultstat>
        <relname>Will</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Will/WC</name>
        <costs>3/6/12/24</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Will</defaultstat>
        <relname>Will</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Per/E</name>
        <costs>1/2/4/8</costs>
        <baseadj>-1</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Perception</defaultstat>
        <relname>Per</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Per/A</name>
        <costs>1/2/4/8</costs>
        <baseadj>-2</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Perception</defaultstat>
        <relname>Per</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Per/H</name>
        <costs>1/2/4/8</costs>
        <baseadj>-3</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Perception</defaultstat>
        <relname>Per</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Per/VH</name>
        <costs>1/2/4/8</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Perception</defaultstat>
        <relname>Per</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Per/WC</name>
        <costs>3/6/12/24</costs>
        <baseadj>-4</baseadj>
        <adds>1</adds>
        <defaultstat>ST:Perception</defaultstat>
        <relname>Per</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>0</subzero>
      </skilltype>
      <skilltype>
        <name>Tech/A</name>
        <costs>1/2/3</costs>
        <baseadj>0</baseadj>
        <adds>1</adds>
        <defaultstat>%default</defaultstat>
        <relname>def</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>-1</subzero>
      </skilltype>
      <skilltype>
        <name>Tech/H</name>
        <costs>2/3/4</costs>
        <baseadj>0</baseadj>
        <adds>1</adds>
        <defaultstat>%default</defaultstat>
        <relname>def</relname>
        <zeropointsokay>0</zeropointsokay>
        <subzero>-1</subzero>
      </skilltype>
      <skilltype>
        <name>Combo/2</name>
        <costs>4/5</costs>
        <baseadj>-6</baseadj>
        <adds>1</adds>
        <defaultstat>%combo</defaultstat>
        <relname>def</relname>
        <zeropointsokay>-1</zeropointsokay>
        <subzero>-1</subzero>
      </skilltype>
      <skilltype>
        <name>Combo/3</name>
        <costs>5/6</costs>
        <baseadj>-12</baseadj>
        <adds>1</adds>
        <defaultstat>%combo</defaultstat>
        <relname>def</relname>
        <zeropointsokay>-1</zeropointsokay>
        <subzero>-1</subzero>
      </skilltype>
    </skilltypes>
    <groups count="62">
      <group count="18">
        <name>AllMetaTraits</name>
        <groupitem>
          <name>AI</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Astral Entity</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Automaton</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Air</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Earth</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Fire</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Ice</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Metal</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Stone</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Water</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Domestic Animal</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Ground Vehicle</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Ichthyoid</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Machine</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Quadruped</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Spirit</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Vermiform</name>
          <itemtype>Packages</itemtype>
        </groupitem>
        <groupitem>
          <name>Wild Animal</name>
          <itemtype>Packages</itemtype>
        </groupitem>
      </group>
      <group count="339">
        <name>AllAdvantages</name>
        <groupitem>
          <name>_New Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Alternative Attacks</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Leveled Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Parent Item</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>360° Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>3D Spatial Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Absolute Direction</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Absolute Timing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute [sense]</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Taste and Smell</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Touch</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Administrative Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Affliction</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ally</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Altered Time Rate</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alternate Form</name>
          <nameext>Cosmetic</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alternate Form</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alternate Identity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ambidexterity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Amphibious</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Friend</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Appearance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Arm DX</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Arm ST</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Artificer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bardic Immunity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Binding</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blessed</name>
          <nameext>Heroic Feat; [Attribute]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blessed</name>
          <nameext>Very Blessed</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blessed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Brachiator</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Breath-Holding</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Burning Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Business Acumen</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Catfall</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chameleon</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Channeling</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Charisma</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chronolocation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claim to Hospitality</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clairsentience</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Blunt Claws</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Hooves</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Long Talons</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Sharp Claws</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Talons</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clerical Investment</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clinging</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Combat Reflexes</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Common Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compartmentalized Mind</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Constriction Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Contact Group</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Contact</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Corrosion Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Courtesy Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Crushing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Adaptability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Familiarity</name>
          <nameext>Alien Culture</nameext>
          <itemtype>Cultures</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Familiarity</name>
          <nameext>Native</nameext>
          <itemtype>Cultures</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Familiarity</name>
          <itemtype>Cultures</itemtype>
        </groupitem>
        <groupitem>
          <name>Cutting Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Damage Resistance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Danger Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Daredevil</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dark Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Destiny</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Digital Mind</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Diplomatic Immunity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discriminatory Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discriminatory Smell</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discriminatory Taste</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Doesn't Breathe</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Doesn't Eat or Drink</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Doesn't Sleep</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dominance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Double-Jointed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Duplication</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Eidetic Memory</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Elastic Skin</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Block</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Dodge</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Air</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Ground</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Space</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Water</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>%Melee Weapon Art%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>%Melee Weapon Sport%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>%Melee Weapon%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>all parries</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>bare hands</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Time Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Tracking</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>ESP Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extended Lifespan</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Arms</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Head</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>3 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>4 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>5 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>6 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>7+ Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Life</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Mouth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra-Flexible Arms</name>
          <nameext>1 Arm</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra-Flexible Arms</name>
          <nameext>2 Arms</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fashion Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fatigue Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fearlessness</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Filter Lungs</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fit</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Flexibility</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Flight</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gadgeteer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>G-Experience</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gifted Artist</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gizmo</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Green Thumb</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Growth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunslinger</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hard to Kill</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hard to Subdue</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Healer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Healing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hermaphromorph</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>High Manual Dexterity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>High Pain Threshold</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>High TL</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Higher Purpose</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Huge Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hyperspectral Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Illuminated</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Imaging Radar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Impaling Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Improved G-Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased SM</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Independent Income</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Indomitable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Infravision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Injury Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Insubstantiality</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Intuition</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Intuitive Mathematician</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Invisibility</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Jumper</name>
          <nameext>Time</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Jumper</name>
          <nameext>World</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ladar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Language - Native</name>
          <nameext>Spoken</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language - Native</name>
          <nameext>Written</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language - Native</name>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language</name>
          <nameext>Spoken</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language</name>
          <nameext>Written</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language Talent</name>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language</name>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Large Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Legal Enforcement Powers</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Legal Immunity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Less Sleep</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lifting ST</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Calculator</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Arms</name>
          <nameext>1 Arm</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Arms</name>
          <nameext>2 Arms</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Legs</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Spines</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Longevity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Luck</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magery 0</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magery</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magic Resistance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mana Damper</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mana Enhancer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematical Ability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Medium</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Merchant Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Metabolism Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Microscopic Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Military Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Probe</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Reading</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Shield</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mindlink</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Chip Slots</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Computer Brain</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Cosmic Power</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Super-Memorization</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Morph</name>
          <nameext>Cosmetic</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Morph</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Ability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Neutralize</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Nictitating Membrane</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Night Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Obscure</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Oracle</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Outdoorsman</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Parabolic Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Para-Radar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Patron</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Payload</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Penetrating Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Perfect Balance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Peripheral Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Permeation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Photographic Memory</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pitiable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>PK Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Plant Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Police Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Possession</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Power Investiture</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Precognition</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pressure Support</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Protected [Sense]</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Psi Static</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychic Healing Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychometry</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Puppet</name>
          <nameext>Group of Related Allies</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Puppet</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Memory</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Bonus</name>
          <nameext>%skills%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Bonus</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Point Bonus</name>
          <nameext>%skills%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Point Bonus</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Spell Bonus</name>
          <nameext>[spell]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Spell Point Bonus</name>
          <nameext>[spell]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Radar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Radiation Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapid Healing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapier Wit</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reawakened</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Recovery</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reduced Consumption</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Regeneration</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Regrowth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Religious Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reputation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Resistant</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magery</name>
          <nameext>%skill%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magery</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magery 0</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sealed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Security Clearance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>See Invisible</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sensitive Touch</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sensitive</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Serendipity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Shadow Form</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Short Spines</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Shrinking</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Signature Gear</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Silence</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Single-Minded</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Slippery</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Small Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Smooth Operator</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Snatcher</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Chameleon</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <nameext>Feared</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <nameext>Respected</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <nameext>Venerated</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sonar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Speak Underwater</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Speak With Animals</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Speak With Plants</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Special Rapport</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Spirit Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Status</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Stretching</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Crushing; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Cutting; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Impaling; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Large Piercing; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Piercing; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striking ST</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Subsonic Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Subsonic Speech</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Super Climbing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Super Jump</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Super Luck</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Supernatural Durability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Blunt Teeth</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Fangs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Sharp Beak</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Sharp Teeth</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Infrared Communication</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Laser Communication</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Radio</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Telesend</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telekinesis</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telepathy Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teleportation Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telescopic Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temperature Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temperature Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temporal Inertia</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Tenure</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Terrain Adaptation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Terror</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Toxic Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Trading Character Points for Money</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Trained By A Master</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>True Faith</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Tunneling</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ultrahearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ultrasonic Speech</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ultravision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unaging</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unfazeable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Universal Digestion</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unkillable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unusual Background</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vacuum Support</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vampiric Bite</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Versatile</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Very Fit</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Very Rapid Healing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vibration Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Visualization</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Voice</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Air</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Liquid</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Warp</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wealth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weapon Master</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wild Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wildcard Magery!</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Xeno-Adaptability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Zeroed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
      </group>
      <group count="137">
        <name>AllAdvantagesMental</name>
        <groupitem>
          <name>_New Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Alternative Attacks</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Leveled Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>3D Spatial Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Absolute Direction</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Absolute Timing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Altered Time Rate</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Friend</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Artificer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blessed</name>
          <nameext>Heroic Feat; [Attribute]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blessed</name>
          <nameext>Very Blessed</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blessed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Business Acumen</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Channeling</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Charisma</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chronolocation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clairsentience</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Combat Reflexes</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Common Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compartmentalized Mind</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Adaptability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Danger Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Daredevil</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Destiny</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dominance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Duplication</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Eidetic Memory</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Block</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Dodge</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>%Melee Weapon Art%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>%Melee Weapon Sport%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>%Melee Weapon%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>all parries</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Parry</name>
          <nameext>bare hands</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Time Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>ESP Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Life</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fearlessness</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gadgeteer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>G-Experience</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gifted Artist</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gizmo</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Green Thumb</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunslinger</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Healer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Healing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Higher Purpose</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Illuminated</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Indomitable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Insubstantiality</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Intuition</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Intuitive Mathematician</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Invisibility</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Jumper</name>
          <nameext>Time</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Jumper</name>
          <nameext>World</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Language Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Calculator</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Luck</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magery 0</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magery</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magic Resistance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mana Damper</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mana Enhancer</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematical Ability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Medium</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Probe</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Reading</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Shield</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mindlink</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Chip Slots</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Computer Brain</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Cosmic Power</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Super-Memorization</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Ability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Neutralize</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Oracle</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Outdoorsman</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Photographic Memory</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>PK Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Plant Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Possession</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Power Investiture</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Precognition</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Psi Static</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychic Healing Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychometry</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Puppet</name>
          <nameext>Group of Related Allies</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Puppet</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Memory</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Bonus</name>
          <nameext>%skills%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Bonus</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Point Bonus</name>
          <nameext>%skills%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Point Bonus</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Spell Bonus</name>
          <nameext>[spell]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Spell Point Bonus</name>
          <nameext>[spell]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapier Wit</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reawakened</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magery</name>
          <nameext>%skill%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magery</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magery 0</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sensitive</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Serendipity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Single-Minded</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Smooth Operator</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Snatcher</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Chameleon</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Speak With Animals</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Speak With Plants</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Special Rapport</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Spirit Empathy</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Super Luck</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Infrared Communication</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Laser Communication</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Radio</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Telesend</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telekinesis</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telepathy Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teleportation Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temperature Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temporal Inertia</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Terror</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Trained By A Master</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>True Faith</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unfazeable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unusual Background</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Versatile</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Visualization</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Warp</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wild Talent</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wildcard Magery!</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Xeno-Adaptability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
      </group>
      <group count="181">
        <name>AllAdvantagesPhysical</name>
        <groupitem>
          <name>_New Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Alternative Attacks</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Leveled Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>360° Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>3D Spatial Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Absolute Direction</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute [sense]</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Taste and Smell</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Touch</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Acute Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Affliction</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alternate Form</name>
          <nameext>Cosmetic</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alternate Form</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ambidexterity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Amphibious</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Appearance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Arm DX</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Arm ST</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Binding</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Brachiator</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Breath-Holding</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Burning Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Catfall</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chameleon</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Blunt Claws</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Hooves</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Long Talons</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Sharp Claws</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claws</name>
          <nameext>Talons</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clinging</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Constriction Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Corrosion Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Crushing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cutting Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Damage Resistance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dark Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Digital Mind</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discriminatory Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discriminatory Smell</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discriminatory Taste</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Doesn't Breathe</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Doesn't Eat or Drink</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Doesn't Sleep</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Double-Jointed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Duplication</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Elastic Skin</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Air</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Ground</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Space</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Move</name>
          <nameext>Water</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enhanced Tracking</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extended Lifespan</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Arms</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Head</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>3 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>4 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>5 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>6 Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Legs</name>
          <nameext>7+ Legs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Mouth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra-Flexible Arms</name>
          <nameext>1 Arm</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra-Flexible Arms</name>
          <nameext>2 Arms</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fatigue Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Filter Lungs</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fit</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Flexibility</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Flight</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Growth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hard to Kill</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hard to Subdue</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hermaphromorph</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>High Manual Dexterity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>High Pain Threshold</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Huge Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hyperspectral Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Imaging Radar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Impaling Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Improved G-Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Infravision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Injury Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Insubstantiality</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ladar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Large Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Less Sleep</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lifting ST</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Arms</name>
          <nameext>1 Arm</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Arms</name>
          <nameext>2 Arms</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Legs</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Long Spines</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Longevity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Metabolism Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Microscopic Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Chip Slots</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Computer Brain</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Cosmic Power</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Modular Abilities</name>
          <nameext>Super-Memorization</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Morph</name>
          <nameext>Cosmetic</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Morph</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Nictitating Membrane</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Night Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Obscure</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Parabolic Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Para-Radar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Payload</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Penetrating Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Perfect Balance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Peripheral Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Permeation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pressure Support</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Protected [Sense]</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Bonus</name>
          <nameext>%skills%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Bonus</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Point Bonus</name>
          <nameext>%skills%</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Skill Point Bonus</name>
          <nameext>[skill]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Spell Bonus</name>
          <nameext>[spell]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Racial Spell Point Bonus</name>
          <nameext>[spell]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Radar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Radiation Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapid Healing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Recovery</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reduced Consumption</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Regeneration</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Regrowth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Resistant</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sealed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>See Invisible</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sensitive Touch</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Shadow Form</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Short Spines</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Shrinking</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Silence</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Slippery</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Small Piercing Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sonar</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Speak Underwater</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Stretching</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Crushing; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Cutting; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Impaling; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Large Piercing; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striker</name>
          <nameext>Piercing; [Description]</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Striking ST</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Subsonic Hearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Subsonic Speech</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Super Climbing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Super Jump</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Supernatural Durability</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Blunt Teeth</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Fangs</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Sharp Beak</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Teeth</name>
          <nameext>Sharp Teeth</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Infrared Communication</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Laser Communication</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Radio</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telecommunication</name>
          <nameext>Telesend</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telekinesis</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Telescopic Vision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temperature Control</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Temperature Tolerance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Terrain Adaptation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Toxic Attack</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Tunneling</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ultrahearing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ultrasonic Speech</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ultravision</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unaging</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Universal Digestion</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unkillable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vacuum Support</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vampiric Bite</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Very Fit</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Very Rapid Healing</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vibration Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Voice</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Air</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Liquid</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weapon Master</name>
          <itemtype>Ads</itemtype>
        </groupitem>
      </group>
      <group count="45">
        <name>AllAdvantagesSocial</name>
        <groupitem>
          <name>_New Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Alternative Attacks</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Leveled Advantage</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Administrative Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ally</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alternate Identity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bardic Immunity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Claim to Hospitality</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clerical Investment</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Contact Group</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Contact</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Courtesy Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Familiarity</name>
          <nameext>Alien Culture</nameext>
          <itemtype>Cultures</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Familiarity</name>
          <nameext>Native</nameext>
          <itemtype>Cultures</itemtype>
        </groupitem>
        <groupitem>
          <name>Cultural Familiarity</name>
          <itemtype>Cultures</itemtype>
        </groupitem>
        <groupitem>
          <name>Diplomatic Immunity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fashion Sense</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>High TL</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Independent Income</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Language - Native</name>
          <nameext>Spoken</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language - Native</name>
          <nameext>Written</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language - Native</name>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language</name>
          <nameext>Spoken</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language</name>
          <nameext>Written</nameext>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Language</name>
          <itemtype>Languages</itemtype>
        </groupitem>
        <groupitem>
          <name>Legal Enforcement Powers</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Legal Immunity</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Merchant Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Military Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Patron</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pitiable</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Police Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Religious Rank</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reputation</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Security Clearance</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Signature Gear</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <nameext>Feared</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <nameext>Respected</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <nameext>Venerated</nameext>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Regard</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Status</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Tenure</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wealth</name>
          <itemtype>Ads</itemtype>
        </groupitem>
        <groupitem>
          <name>Zeroed</name>
          <itemtype>Ads</itemtype>
        </groupitem>
      </group>
      <group count="11">
        <name>AllPerks</name>
        <groupitem>
          <name>_New Perk</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Accessory</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Alcohol Tolerance</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Autotrance</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Deep Sleeper</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Fur</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Honest Face</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>No Hangover</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Penetrating Voice</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Sanitized Metabolism</name>
          <itemtype>Perks</itemtype>
        </groupitem>
        <groupitem>
          <name>Shtick</name>
          <itemtype>Perks</itemtype>
        </groupitem>
      </group>
      <group count="268">
        <name>AllDisadvantages</name>
        <groupitem>
          <name>_New Disadvantage</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>_New Parent Item</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Absent-Mindedness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Addiction</name>
          <nameext>[Physiological]</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Addiction</name>
          <nameext>[Psychological]</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Addiction</name>
          <nameext>Heroin</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Addiction</name>
          <nameext>Tobacco</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Alcoholism</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Amnesia</name>
          <nameext>Partial</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Amnesia</name>
          <nameext>Total</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Appearance</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bad Back</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bad Grip</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bad Sight</name>
          <nameext>Farsighted</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bad Sight</name>
          <nameext>Nearsighted</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bad Smell</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bad Temper</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Berserk</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bestial</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Blindness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bloodlust</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Bully</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Callous</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cannot Kick</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cannot Learn</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cannot Speak</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Charitable</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chronic Depression</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chronic Pain</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Chummy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Clueless</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <nameext>Chivalry</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <nameext>Gentleman's</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <nameext>Pirate's</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <nameext>Professional</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <nameext>Soldier's</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cold-Blooded</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Colorblindness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Combat Paralysis</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Behavior</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Carousing</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Gambling</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Generosity</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Lying</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Spending</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Compulsive Vowing</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Confused</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cowardice</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Curious</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Cursed</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Deafness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Debt</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Decreased Time Rate</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Delusion</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dependency</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dependent</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Destiny</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discipline of Faith</name>
          <nameext>Asceticism</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discipline of Faith</name>
          <nameext>Monasticism</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discipline of Faith</name>
          <nameext>Mysticism</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discipline of Faith</name>
          <nameext>Ritualism</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Discipline of Faith</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Disturbing Voice</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Divine Curse</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Draining</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dread</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Duty</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dwarfism</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Dyslexia</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Easy to Kill</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Easy to Read</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Electrical</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enemy</name>
          <nameext>Formidable group</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enemy</name>
          <nameext>Less powerful group</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Enemy</name>
          <nameext>One Person</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Epilepsy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Extra Sleep</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fanaticism</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fat</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fearfulness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Flashbacks</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fragile</name>
          <nameext>Brittle</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fragile</name>
          <nameext>Combustible</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fragile</name>
          <nameext>Explosive</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fragile</name>
          <nameext>Flammable</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fragile</name>
          <nameext>Unnatural</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Fragile</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Frightens Animals</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gigantism</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>G-Intolerance</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gluttony</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Greed</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gregarious</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Guilt Complex</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Gullibility</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Ham-Fisted</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hard of Hearing</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hemophilia</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hidebound</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Honesty</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Horizontal</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Hunchback</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Impulsiveness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased Consumption</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased Life Support</name>
          <nameext>Extreme Heat/Cold</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased Life Support</name>
          <nameext>Massive</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased Life Support</name>
          <nameext>Pressurized</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased Life Support</name>
          <nameext>Radioactive</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Increased Life Support</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Incurious</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Indecisive</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Infectious Attack</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Innumerate</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Insomniac</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Intolerance</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Invertebrate</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Jealousy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Killjoy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Kleptomania</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Klutz</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lame</name>
          <nameext>Crippled Legs</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lame</name>
          <nameext>Legless</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lame</name>
          <nameext>Missing Legs</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lame</name>
          <nameext>Paraplegic</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Laziness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lecherousness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lifebane</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Light Sleeper</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Loner</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Low Empathy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Low Pain Threshold</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Low Self-Image</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Low TL</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Lunacy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Magic Susceptibility</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Maintenance</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Manic-Depressive</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Megalomania</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Miserliness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Missing Digit</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mistaken Identity</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Motion Sickness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mundane Background</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Mute</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Neurological Disorder</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Night Blindness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Nightmares</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Depth Perception</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Fine Manipulators</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Aerial</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Aquatic</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Bounces</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Rolls</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Semi-Aquatic</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Sessile</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Slithers</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Tracked</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Legs</name>
          <nameext>Wheeled</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Manipulators</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Physical Attack</name>
          <nameext>1 Arm</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Physical Attack</name>
          <nameext>2 Arms</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Sense of Humor</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>No Sense of Smell/Taste</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Nocturnal</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Noisy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Non-Iconographic</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Numb</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Oblivious</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Obsession</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Odious Personal Habit</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>On the Edge</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>One Arm</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>One Eye</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>One Hand</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Overconfidence</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Overweight</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pacifism</name>
          <nameext>Cannot Harm Innocents</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pacifism</name>
          <nameext>Cannot Kill</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pacifism</name>
          <nameext>Reluctant Killer</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pacifism</name>
          <nameext>Self-Defense Only</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pacifism</name>
          <nameext>Total Nonviolence</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Paranoia</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Phantom Voices</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Phobia</name>
          <nameext>%example%</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Phobia</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Post-Combat Shakes</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Pyromania</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Quadriplegic</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reprogrammable</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Reputation</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Restricted Diet</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Restricted Vision</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Revulsion</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sadism</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Secret Identity</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Secret</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Self-Destruct</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Selfish</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Selfless</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Semi-Upright</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense of Duty</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Shadow Form</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Short Arms</name>
          <nameext>1 Arm</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Short Arms</name>
          <nameext>2 Arms</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Short Attention Span</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Short Lifespan</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Shyness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Skinny</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Slave Mentality</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleepwalker</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleepy</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Slow Eater</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Slow Healing</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Slow Riser</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Disease</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Criminal Record</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Disowned</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Excommunicated</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Ignorant</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Minor</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Minority Group</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Monster</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Publically disowned</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Second-Class Citizen</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Subjugated</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Uneducated</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <nameext>Valuable Property</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Social Stigma</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Space Sickness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Split Personality</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Squeamish</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Status</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Stress Atavism</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Stubbornness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Stuttering</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Supernatural Feature</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Supersensitive</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Susceptible to [Common]</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Susceptible to [Occasional]</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Susceptible to [Very Common]</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Terminally Ill</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Timesickness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Trademark</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Trickster</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Truthfulness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Uncontrollable Appetite</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unfit</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unhealing</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unique</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unluckiness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unnatural Feature</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Unusual Biochemistry</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Very Fat</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Very Unfit</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vow</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Vulnerability</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weak Arms</name>
          <nameext>1 Arm</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weak Arms</name>
          <nameext>2 Arms</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weak Bite</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weakness</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wealth</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weapon Mount</name>
          <nameext>1 Arm</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weapon Mount</name>
          <nameext>2 Arms</nameext>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Weirdness Magnet</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Workaholic</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Wounded</name>
          <itemtype>Disads</itemtype>
        </groupitem>
        <groupitem>
          <name>Xenophilia</name>
          <itemtype>Disads</itemtype>
        </groupitem>
      </group>
      <group count="43">
        <name>AllQuirks</name>
        <groupitem>
          <name>_New Quirk</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>_Unused Quirk 1</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>_Unused Quirk 2</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>_Unused Quirk 3</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>_Unused Quirk 4</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>_Unused Quirk 5</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Acceleration Weakness</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Alcohol Intolerance</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Attentive</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Bowlegged</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Broad-Minded</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Cannot Float</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Careful</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Chauvinistic</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Code of Honor</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Congenial</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Delusion</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Dislikes [specify]</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Distinctive Feature</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Distractible</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Dreamer</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Dull</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Expression</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Habit</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Horrible Hangovers</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Humble</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Imaginative</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Incompetence</name>
          <nameext>%skills%</nameext>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Incompetence</name>
          <nameext>[skill]</nameext>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Likes [specify]</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Minor Handicap</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Nervous Stomach</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Neutered</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Nosy</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Obsession</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Personality Change</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Proud</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Responsive</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Sexless</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Staid</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Trademark</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Uncongenial</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
        <groupitem>
          <name>Vow</name>
          <itemtype>Quirks</itemtype>
        </groupitem>
      </group>
      <group count="562">
        <name>AllSkills</name>
        <groupitem>
          <name>Accounting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Acrobatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Acting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Administration</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Aerobatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Airshipman</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Alchemy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Handling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Handling</name>
          <nameext>Big Cats</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Handling</name>
          <nameext>Dogs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Handling</name>
          <nameext>Equines</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Animal Handling</name>
          <nameext>Raptors</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Anthropology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Aquabatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Archaeology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Architecture</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Area Knowledge</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Battlesuits</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Body Armor</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Force Shields</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Heavy Weapons</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Melee Weapons</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Missile Weapons</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Small Arms</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Armoury</name>
          <nameext>Vehicular Armor</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Beams</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Bombs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Cannon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Catapult</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Guided Missile</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Torpedoes</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Body Art</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Calligraphy</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Drawing</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Illumination</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Illusion</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Interior Decorating</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Painting</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Pottery</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Scene Design</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Sculpting</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artist</name>
          <nameext>Woodworking</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Astronomy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Astronomy</name>
          <nameext>Observational</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Autohypnosis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Battlesuit</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <nameext>Pistol</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <nameext>Projector</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <nameext>Rifle</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bicycling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bioengineering</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bioengineering</name>
          <nameext>Cloning</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bioengineering</name>
          <nameext>Genetic Engineering</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bioengineering</name>
          <nameext>Tissue Engineering</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <nameext>Earthlike</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <nameext>Gas Giants</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <nameext>Hostile Terrestrial</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <nameext>Ice Dwarfs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <nameext>Ice Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Biology</name>
          <nameext>Rock Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Blind Fighting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Blowpipe</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Boating</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Boating</name>
          <nameext>Large Powerboat</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Boating</name>
          <nameext>Motorboat</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Boating</name>
          <nameext>Sailboat</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Boating</name>
          <nameext>Unpowered</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Body Control</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Body Language</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Body Sense</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bolas</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bow</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Boxing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Brainwashing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Brawling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Breaking Blow</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Breath Control</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Broadsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Camouflage</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Carousing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Carpentry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cartography</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Chemistry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Climbing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cloak</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Computer Hacking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Computer Operation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Computer Programming</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <nameext>Dance</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <nameext>Literature</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <nameext>Music</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <nameext>Visual Arts</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <nameext>Wine</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cooking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Counterfeiting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Criminology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Crossbow</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cryptography</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Business</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Headline News</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>High Culture</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>People</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Politics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Popular Culture</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Science &amp; Technology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Sports</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Current Affairs</name>
          <nameext>Travel</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Dancing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect Lies</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Diagnosis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Disguise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Diving Suit</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Dreaming</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Automobile</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Construction Equipment</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Halftrack</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Heavy Wheeled</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Hovercraft</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Locomotive</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Mecha</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Motorcycle</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Driving</name>
          <nameext>Tracked</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Dropping</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Economics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electrician</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Communications</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Electronic Warfare</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Force Shields</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Matter Transmitters</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Media</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Medical</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Parachronic</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Psychotronics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Scientific</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Security</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Sensors</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Sonar</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Surveillance</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Operation</name>
          <nameext>Temporal</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Communications</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Computers</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Electronic Warfare</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Force Shields</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Matter Transmitters</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Media</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Medical</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Parachronic</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Psychotronics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Scientific</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Security</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Sensors</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Sonar</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Surveillance</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <nameext>Temporal</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Artillery</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Civil</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Combat</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Electrical</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Electronics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Materials</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Microtechnology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Mining</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Nanotechnology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Parachronic</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Psychotronics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <nameext>Temporal</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Enthrallment</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Enthrallment</name>
          <nameext>Captivate</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Enthrallment</name>
          <nameext>Persuade</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Enthrallment</name>
          <nameext>Suggest</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Enthrallment</name>
          <nameext>Sway Emotions</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Escape</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Esoteric Medicine</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Exorcism</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Computer Security</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Egyptology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Epidemiology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Hydrology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Military Science</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Natural Philosophy</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Political Science</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Psionics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Thanatology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Expert Skill</name>
          <nameext>Xenology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosives</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosives</name>
          <nameext>Demolition</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosives</name>
          <nameext>Explosive Ordnance Disposal</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosives</name>
          <nameext>Fireworks</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosives</name>
          <nameext>Nuclear Ordnance Disposal</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosives</name>
          <nameext>Underwater Demolition</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Falconry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Farming</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Ammo</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Arrow</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Force Sword</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Knife</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Long Arm</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Pistol</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Sword</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <nameext>Two-Handed Sword</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Filch</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Finance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fire Eating</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>First Aid</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fishing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Flight</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Flying Leap</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Forced Entry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Forensics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Forgery</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Astrology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Augury</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Crystal Gazing</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Dream Interpretation</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Feng Shui</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Palmistry</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <nameext>Tarot</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Forward Observer</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Free Fall</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Freight Handling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gambling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Games</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gardening</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Garrote</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Earthlike</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Gas Giants</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Hostile Terrestrial</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Ice Dwarfs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Ice Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Political</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geography</name>
          <nameext>Rock Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <nameext>Earthlike</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <nameext>Gas Giants</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <nameext>Hostile Terrestrial</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <nameext>Ice Dwarfs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <nameext>Ice Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Geology</name>
          <nameext>Rock Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gesture</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Group Performance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Group Performance</name>
          <nameext>Choreography</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Group Performance</name>
          <nameext>Conducting</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Group Performance</name>
          <nameext>Directing</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Group Performance</name>
          <nameext>Fight Choreography</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Beams</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Cannon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Catapult</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Machine Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Rockets</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Grenade Launcher</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Gyroc</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Light Anti-Armor Weapon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Light Machine Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Musket</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Pistol</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Rifle</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Shotgun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Submachine Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hazardous Materials</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hazardous Materials</name>
          <nameext>Biological</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hazardous Materials</name>
          <nameext>Chemical</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hazardous Materials</name>
          <nameext>Radioactive</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Heraldry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Herb Lore</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hidden Lore</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hidden Lore</name>
          <nameext>Conspiracies</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hidden Lore</name>
          <nameext>Demon Lore</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hidden Lore</name>
          <nameext>Faerie Lore</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hidden Lore</name>
          <nameext>Spirit Lore</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hiking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>History</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hobby Skill</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Holdout</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Housekeeping</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Hypnotism</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Immovable Stance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Beam</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Breath</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Gaze</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Projectile</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Intelligence Analysis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Interrogation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Intimidation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jeweler</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jitte/Sai</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Judo</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jumping</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Karate</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Kiai</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Knife</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Knot-Tying</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Kusari</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lasso</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Law</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leadership</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leatherworking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lifting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Light Walk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Linguistics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lip Reading</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Flamethrower</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Sprayer</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Squirt Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Water Cannon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Literature</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lockpicking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Machinist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Main-Gauche</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Makeup</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Market Analysis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Masonry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <nameext>Applied</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <nameext>Computer Science</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <nameext>Cryptology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <nameext>Pure</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <nameext>Statistics</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <nameext>Surveying</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mechanic</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meditation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mental Strength</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Merchant</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Metallurgy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <nameext>Earthlike</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <nameext>Gas Giants</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <nameext>Hostile Terrestrial</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <nameext>Ice Dwarfs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <nameext>Ice Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Meteorology</name>
          <nameext>Rock Worlds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <nameext>Animal Sounds</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <nameext>Bird Calls</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <nameext>Speech</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind Block</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Monowire Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mount</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Composition</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Influence</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Instrument</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Naturalist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Air</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Hyperspace</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Land</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Sea</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Space</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>NBC Suit</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Net</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Observation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Occultism</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Packing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Paleontology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Paleontology</name>
          <nameext>Micropaleontology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Paleontology</name>
          <nameext>Paleoanthropology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Paleontology</name>
          <nameext>Paleobotany</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Paleontology</name>
          <nameext>Paleozoology</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Panhandling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Parachuting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Parry Missile Weapons</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Performance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Pharmacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Philosophy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Photography</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Physician</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Physics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Physiology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Pickpocket</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Aerospace</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Autogyro</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Contragravity</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Flight Pack</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Glider</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Heavy Airplane</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Helicopter</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>High-Performance Airplane</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>High-Performance Spacecraft</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Light Airplane</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Lighter-Than-Air</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Lightsail</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Low-G Wings</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Low-Performance Spacecraft</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Ultralight</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <nameext>Vertol</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Poetry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Poisons</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Polearm</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Politics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Power Blow</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Pressure Points</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Pressure Secrets</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Air Traffic Controller</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Barber</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Brewer</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Cooper</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Distiller</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Dyer</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Florist</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Game Designer</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Glassblower</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Journalist</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Prostitute</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Tailor</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Tanner</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Vinter</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Professional Skill</name>
          <nameext>Weaver</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Propaganda</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Prospecting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <nameext>Debate</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <nameext>Oratory</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <nameext>Punning</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <nameext>Rhetoric</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <nameext>Storytelling</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Push</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapier</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Religious Ritual</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Research</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Riding</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Ritual Magic</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Running</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Saber</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <nameext>Dojo</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <nameext>High Society</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <nameext>Mafia</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <nameext>Military</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <nameext>Police</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <nameext>Servant</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Scrounging</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Scuba</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Seamanship</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Search</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sewing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shadowing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Buckler</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Force</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Shield</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shiphandling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shiphandling</name>
          <nameext>Airship</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shiphandling</name>
          <nameext>Ship</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shiphandling</name>
          <nameext>Spaceship</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shiphandling</name>
          <nameext>Starship</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shiphandling</name>
          <nameext>Submarine</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shortsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Singing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Skating</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Skiing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleight of Hand</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smallsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smith</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smith</name>
          <nameext>Copper</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smith</name>
          <nameext>Iron</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smith</name>
          <nameext>Lead and Tin</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smuggling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sociology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Soldier</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spacer</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spear</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spear Thrower</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Speed-Reading</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sports</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Stage Combat</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Stealth</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Strategy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Strategy</name>
          <nameext>Air</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Strategy</name>
          <nameext>Interstellar</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Strategy</name>
          <nameext>Land</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Strategy</name>
          <nameext>Naval</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Strategy</name>
          <nameext>Space</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Streetwise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Submarine</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Submarine</name>
          <nameext>Free-Flooding Sub</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Submarine</name>
          <nameext>Large Sub</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Submarine</name>
          <nameext>Mini-Sub</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Submariner</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sumo Wrestling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Surgery</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Arctic</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Bank</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Deep Ocean Vent</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Desert</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Fresh-Water Lake</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Island/Beach</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Jungle</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Mountain</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Open Ocean</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Plains</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Radioactive Wasteland</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Reef</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>River/Stream</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Salt-Water Sea</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Swampland</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Tropical Lagoon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <nameext>Woodlands</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Swimming</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Symbol Drawing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tactics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Teaching</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Teamster</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thaumatology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Theology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Throwing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Axe/Mace</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Dart</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Harpoon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Knife</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Shuriken</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Spear</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Stick</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tonfa</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tracking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Traps</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Typing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Urban Survival</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Vacc Suit</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Ventriloquism</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Veterinary</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Weather Sense</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Weird Science</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Wrestling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Writing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Zen Archery</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="100">
        <name>AllSpellsMagical</name>
        <groupitem>
          <name>Accuracy</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Analyze Magic</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Apportation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Armor</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Aura</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Awaken</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Banish</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Blur</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Breathe Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Clumsiness</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Cold</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Command</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Continual Light</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Counterspell</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Darkness</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Daze</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Death Vision</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deathtouch</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect Energy</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect Missile</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Destroy Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect Magic</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Dispel Magic</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Stone</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Enchant</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Entombment</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosive Fireball</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Extinguish Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fireball</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Flesh to Stone</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fog</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Foolishness</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Forgetfulness</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortify</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Great Haste</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Great Healing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Haste</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Heat</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Hide Thoughts</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Hinder</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Icy Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Identify Spell</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Ignite Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Itch</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Energy</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Vitality</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Light</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lockmaster</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Magelock</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Major Healing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mass Daze</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mass Sleep</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind-Reading</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Minor Healing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>No-Smell</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Pain</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Paralyze Limb</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Planar Summons</name>
          <nameext>[Plane]</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Plane Shift</name>
          <nameext>[Plane]</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Predict Weather</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Puissance</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Recover Energy</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Cold</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Rooted Feet</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seeker</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Emotion</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Foes</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Spirit</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleep</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Spasm</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stench</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Flesh</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Summon Demon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Summon Spirit</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Trace</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Truthsayer</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Turn Zombie</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Wither Limb</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Zombie</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="100">
        <name>AllSpellsRitual</name>
        <groupitem>
          <name>Accuracy</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Analyze Magic</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Apportation</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Armor</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Aura</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Awaken</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Banish</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Blur</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Breathe Water</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Clumsiness</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Cold</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Command</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Continual Light</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Counterspell</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Air</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Earth</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fire</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Water</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Darkness</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Daze</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Death Vision</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deathtouch</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect Energy</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect Missile</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Destroy Water</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect Magic</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Dispel Magic</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Air</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Stone</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Enchant</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Entombment</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosive Fireball</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Extinguish Fire</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fireball</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Flesh to Stone</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fog</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Foolishness</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Forgetfulness</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortify</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Great Haste</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Great Healing</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Haste</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Heat</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Hide Thoughts</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Hinder</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Icy Weapon</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Identify Spell</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Ignite Fire</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Itch</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Energy</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Vitality</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Light</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lockmaster</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Magelock</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Major Healing</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mass Daze</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mass Sleep</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind-Reading</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Minor Healing</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>No-Smell</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Pain</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Paralyze Limb</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Planar Summons</name>
          <nameext>[Plane]; Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Plane Shift</name>
          <nameext>[Plane]; Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Power</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Predict Weather</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Puissance</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Air</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Water</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Recover Energy</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Cold</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Fire</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Rooted Feet</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Earth</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Water</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seeker</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Emotion</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Foes</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Spirit</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Air</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Earth</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Fire</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Water</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleep</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Spasm</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stench</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Earth</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Flesh</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Summon Demon</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Summon Spirit</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Trace</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Truthsayer</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Turn Zombie</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Air</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Wither Limb</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Zombie</name>
          <nameext>Ritual</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="100">
        <name>AllSpellsClerical</name>
        <groupitem>
          <name>Accuracy</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Analyze Magic</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Apportation</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Armor</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Aura</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Awaken</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Banish</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Blur</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Breathe Water</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Clumsiness</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Cold</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Command</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Continual Light</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Counterspell</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Air</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Earth</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fire</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Water</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Darkness</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Daze</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Death Vision</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deathtouch</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect Energy</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Deflect Missile</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Destroy Water</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect Magic</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Dispel Magic</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Air</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Stone</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Enchant</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Entombment</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosive Fireball</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Extinguish Fire</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fireball</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Flesh to Stone</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fog</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Foolishness</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Forgetfulness</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortify</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Great Haste</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Great Healing</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Haste</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Heat</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Hide Thoughts</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Hinder</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Icy Weapon</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Identify Spell</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Ignite Fire</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Itch</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Energy</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Vitality</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Light</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lockmaster</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Magelock</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Major Healing</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mass Daze</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mass Sleep</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mind-Reading</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Minor Healing</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>No-Smell</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Pain</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Paralyze Limb</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Planar Summons</name>
          <nameext>[Plane]; Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Plane Shift</name>
          <nameext>[Plane]; Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Power</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Predict Weather</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Puissance</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Air</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Water</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Recover Energy</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Cold</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Fire</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Rooted Feet</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Earth</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Water</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seeker</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Emotion</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Foes</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sense Spirit</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Air</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Earth</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Fire</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Water</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleep</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Spasm</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stench</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Earth</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Flesh</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Summon Demon</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Summon Spirit</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Trace</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Truthsayer</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Turn Zombie</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Walk on Air</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Wither Limb</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Zombie</name>
          <nameext>Clerical</nameext>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="16">
        <name>AllCollegesMagical</name>
        <groupitem>
          <name>Air</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Body Control</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Communication &amp; Empathy</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Earth</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Enchantment</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Fire</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Gate</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Healing</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Knowledge</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Light &amp; Darkness</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Meta-Spells</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Mind Control</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Movement</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Necromancy</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Protection &amp; Warning</name>
          <itemtype />
        </groupitem>
        <groupitem>
          <name>Water</name>
          <itemtype />
        </groupitem>
      </group>
      <group count="32">
        <name>Bad Grip</name>
        <groupitem>
          <name>Climbing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Judo</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sumo Wrestling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Wrestling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Broadsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cloak</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Garrote</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jitte/Sai</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Knife</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Kusari</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Main-Gauche</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Monowire Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Parry Missile Weapons</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Polearm</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapier</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Saber</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shortsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smallsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spear</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tonfa</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="2">
        <name>Conducting</name>
        <groupitem>
          <name>Musical Instrument</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Singing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="1">
        <name>Musical Instrument</name>
        <groupitem>
          <name>Musical Instrument</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="2">
        <name>Appeal</name>
        <groupitem>
          <name>Appealing</name>
          <itemtype>Stats</itemtype>
        </groupitem>
        <groupitem>
          <name>Unappealing</name>
          <itemtype>Stats</itemtype>
        </groupitem>
      </group>
      <group count="4">
        <name>3D Spatial Sense</name>
        <groupitem>
          <name>Aerobatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Free Fall</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Hyperspace</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Space</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="4">
        <name>Absolute Direction</name>
        <groupitem>
          <name>Body Sense</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Air</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Land</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <nameext>Sea</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="6">
        <name>Animal Friend</name>
        <groupitem>
          <name>Animal Handling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Falconry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Packing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Riding</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Teamster</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Veterinary</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="9">
        <name>Artificer</name>
        <groupitem>
          <name>Armoury</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Carpentry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electrician</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Electronics Repair</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Machinist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Masonry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mechanic</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smith</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="8">
        <name>Business Acumen</name>
        <groupitem>
          <name>Accounting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Administration</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Economics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Finance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gambling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Market Analysis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Merchant</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Propaganda</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="4">
        <name>Charisma</name>
        <groupitem>
          <name>Fortune-Telling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leadership</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Panhandling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="4">
        <name>Combat Reflexes</name>
        <groupitem>
          <name>Dodge</name>
          <itemtype>Stats</itemtype>
        </groupitem>
        <groupitem>
          <name>Parry</name>
          <itemtype>Stats</itemtype>
        </groupitem>
        <groupitem>
          <name>Block</name>
          <itemtype>Stats</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Draw</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="2">
        <name>Empathy</name>
        <groupitem>
          <name>Detect Lies</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fortune-Telling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="3">
        <name>Flexibility</name>
        <groupitem>
          <name>Climbing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Escape</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Erotic Art</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="5">
        <name>Gifted Artist</name>
        <groupitem>
          <name>Artist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jeweler</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leatherworking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Photography</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sewing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="5">
        <name>Green Thumb</name>
        <groupitem>
          <name>Biology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Farming</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gardening</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Herb Lore</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Naturalist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="9">
        <name>Healer</name>
        <groupitem>
          <name>Diagnosis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Esoteric Medicine</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>First Aid</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Pharmacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Physician</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Physiology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Surgery</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Veterinary</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="9">
        <name>High Manual Dexterity</name>
        <groupitem>
          <name>Artist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jeweler</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Knot-Tying</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leatherworking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lockpicking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Pickpocket</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sewing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sleight of Hand</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Surgery</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="2">
        <name>Hunchback</name>
        <groupitem>
          <name>Disguise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shadowing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="3">
        <name>Hyperspectral Vision</name>
        <groupitem>
          <name>Forensics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Observation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Search</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="6">
        <name>Influence Skills</name>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Intimidation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Streetwise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="4">
        <name>Killjoy</name>
        <groupitem>
          <name>Carousing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Connoisseur</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Erotic Art</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gambling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="16">
        <name>Low Empathy</name>
        <groupitem>
          <name>Acting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Carousing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Criminology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect Lies</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Enthrallment</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Interrogation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leadership</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Merchant</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Politics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Psychology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sociology</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Streetwise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="8">
        <name>Mathematical Ability</name>
        <groupitem>
          <name>Accounting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Astronomy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cryptography</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Engineer</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Finance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Market Analysis</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mathematics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Physics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="5">
        <name>Musical Ability</name>
        <groupitem>
          <name>Group Performance</name>
          <nameext>Conducting</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Composition</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Influence</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Musical Instrument</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Singing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="6">
        <name>Oblivious</name>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Intimidation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Streetwise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="7">
        <name>Outdoorsman</name>
        <groupitem>
          <name>Camouflage</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fishing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Naturalist</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Navigation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Survival</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tracking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="5">
        <name>Perfect Balance</name>
        <groupitem>
          <name>Acrobatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Aerobatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Aquabatics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Climbing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Piloting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="15">
        <name>Seek Spells</name>
        <groupitem>
          <name>Seek Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Coastline</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Food</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Gate</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Machine</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Magic</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Pass</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Plant</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Plastic</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="15">
        <name>Shyness</name>
        <groupitem>
          <name>Acting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Carousing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Intimidation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leadership</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Merchant</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Panhandling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Performance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Politics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Streetwise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Teaching</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="13">
        <name>Smooth Operator</name>
        <groupitem>
          <name>Acting</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Carousing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Detect Lies</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Intimidation</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Leadership</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Panhandling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Politics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Savoir-Faire</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Streetwise</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="6">
        <name>Stuttering</name>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Performance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Singing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="8">
        <name>Voice</name>
        <groupitem>
          <name>Diplomacy</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Fast-Talk</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Mimicry</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Performance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Politics</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Public Speaking</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sex Appeal</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Singing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="6">
        <name>Unarmed Combat Skill</name>
        <groupitem>
          <name>Boxing</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Brawling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Karate</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Judo</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sumo Wrestling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Wrestling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="26">
        <name>Melee Weapon Skill</name>
        <groupitem>
          <name>Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Broadsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Cloak</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Garrote</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jitte/Sai</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Knife</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Kusari</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lance</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Main-Gauche</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Monowire Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Parry Missile Weapons</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Polearm</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapier</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Saber</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shortsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smallsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spear</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tonfa</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Two-Handed Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="20">
        <name>One-Handed Melee Weapon Skill</name>
        <groupitem>
          <name>Axe/Mace</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Broadsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Flail</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Sword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Force Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Garrote</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Jitte/Sai</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Knife</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Kusari</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Main-Gauche</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Monowire Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Polearm</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Rapier</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Saber</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shortsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Smallsword</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spear</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Staff</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Tonfa</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Whip</name>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="3">
        <name>ShieldSkill</name>
        <groupitem>
          <name>Shield</name>
          <nameext>Shield</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Buckler</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Shield</name>
          <nameext>Force</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="47">
        <name>Ranged Weapon Skill</name>
        <groupitem>
          <name>Artillery</name>
          <nameext>Beams</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Bombs</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Cannon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Catapult</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Guided Missile</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Artillery</name>
          <nameext>Torpedoes</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <nameext>Pistol</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <nameext>Projector</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Beam Weapons</name>
          <nameext>Rifle</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Blowpipe</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bolas</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Bow</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Crossbow</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Dropping</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Beams</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Cannon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Catapult</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Machine Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Gunner</name>
          <nameext>Rockets</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Grenade Launcher</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Gyroc</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Light Anti-Armor Weapon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Light Machine Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Musket</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Pistol</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Rifle</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Shotgun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Guns</name>
          <nameext>Submachine Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Beam</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Breath</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Gaze</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Innate Attack</name>
          <nameext>Projectile</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Lasso</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Flamethrower</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Sprayer</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Squirt Gun</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Liquid Projector</name>
          <nameext>Water Cannon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Net</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Sling</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Spear Thrower</name>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Axe/Mace</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Dart</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Harpoon</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Knife</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Shuriken</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Spear</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
        <groupitem>
          <name>Thrown Weapon</name>
          <nameext>Stick</nameext>
          <itemtype>Skills</itemtype>
        </groupitem>
      </group>
      <group count="5">
        <name>Animal Control</name>
        <groupitem>
          <name>Bird Control</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Fish Control</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Mammal Control</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Reptile Control</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Vermin Control</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="22">
        <name>Create Spells</name>
        <groupitem>
          <name>Create Acid</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Air Elemental</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Animal</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Door</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Earth Elemental</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fire Elemental</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Food</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Gate</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Ice</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Mount</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Object</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Plant</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Servant</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Spring</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Steam</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Warrior</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Water Elemental</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="3">
        <name>Dull Senses</name>
        <groupitem>
          <name>Dull Hearing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Dull Taste and Smell</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Dull Vision</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="16">
        <name>Energy Spells</name>
        <groupitem>
          <name>Seek Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Test Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Preserve Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Purify Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Create Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Essential Fuel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stop Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lend Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Propel</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Conduct Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Steal Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Draw Power</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Magnetic Vision</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Radio Hearing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Spectrum Vision</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="3">
        <name>Keen Senses</name>
        <groupitem>
          <name>Keen Hearing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Keen Taste and Smell</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Keen Vision</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="11">
        <name>Lightning Spells</name>
        <groupitem>
          <name>Ball of Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Body of Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Explosive Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Armor</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Missiles</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Stare</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Lightning Whip</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Wall of Lightning</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="8">
        <name>Radiation Spells</name>
        <groupitem>
          <name>Breathe Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Cure Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Extinguish Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Irradiate</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Radiation Jet</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Resist Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>See Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Seek Radiation</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="4">
        <name>Restore Spells</name>
        <groupitem>
          <name>Restore Hearing</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Restore Memory</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Restore Sight</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Restore Speech</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="9">
        <name>Shape Spells</name>
        <groupitem>
          <name>Shape Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Darkness</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Fire</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Light</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Metal</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Plant</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Plastic</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Shape Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="1">
        <name>Shapeshifting</name>
        <groupitem>
          <name>Shapeshifting</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="8">
        <name>Transmutation Spells</name>
        <groupitem>
          <name>Earth to Air</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Stone</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Earth to Water</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Flesh to Ice</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Flesh to Stone</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Earth</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Stone to Flesh</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Water to Wine</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
      <group count="16">
        <name>Weapon Enchantments</name>
        <groupitem>
          <name>Accuracy</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Bane</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Blank Spell Arrow</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Cornucopia</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Dancing Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Defending Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Ghost Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Graceful Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Loyal Sword</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Penetration Weapon</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Puissance</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Quick-Aim</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Quick-Draw</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Speed Spell Arrow</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Spell Arrow</name>
          <itemtype>Spells</itemtype>
        </groupitem>
        <groupitem>
          <name>Weapon Spirit</name>
          <itemtype>Spells</itemtype>
        </groupitem>
      </group>
    </groups>
    <categories count="218">
      <category>
        <name>%NewSpellList%</name>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>_Armor</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Armor - High-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Armor - Low-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Armor - Shields</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Armor - Ultra-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Fencing Weapons</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Firearms</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Firearms - High-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Firearms - Ultra-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_General</name>
        <itemtype>Perks</itemtype>
      </category>
      <category>
        <name>_General</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>_Grenades</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Melee Weapons</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Melee Weapons - Basic Set</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Muscle-Powered Ranged Weapons</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_Muscle-Powered Ranged Weapons - Basic Set</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_New Equipment</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>_New Skills</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>_Vehicles</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Air</name>
        <code>Ai</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Animal</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Arts/Entertainment</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Athletic</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Athletic - Combat Art/Sport</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Attributes</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Attributes</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Basic Set</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Animals</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Animals - Equestrian Gear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Animals - Horse Armor/Barding</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - High-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - High-Tech - Body Armor</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - High-Tech - Environment Suits</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - High-Tech - Gloves and Footwear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - High-Tech - Headgear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - High-Tech - Shields</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech - Armor Suits</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech - Body Armor</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech - Gloves and Footwear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech - Headgear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech - Limb Armor</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Low-Tech - Shields</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Ultra-Tech</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Ultra-Tech - Body Armor</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Ultra-Tech - Environment Suits</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Ultra-Tech - Gloves and Footwear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Ultra-Tech - Headgear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Armor - Ultra-Tech - Shields</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Clothing</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Firearms</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Firearms - Pistols &amp; SMGs</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Firearms - Rifles and Shotguns</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Firearms - Ultra-Tech Firearms</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Hand Grenades and Incendiaries</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Heavy Weapons</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Melee Weapons</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Camping &amp; Survival Gear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Communications &amp; Information Gear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Law-Enforcement Thief &amp; Spy Gear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Medical Gear</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Optics &amp; Sensors</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Tools</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Miscellaneous Equipment - Weapon &amp; Combat Accessories</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Muscle-Powered Ranged Weapons</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Natural Attacks</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Vehicles - Aircraft</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Vehicles - Ground</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Vehicles - Spacecraft</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Basic Set - Vehicles - Watercraft</name>
        <itemtype>Equipment</itemtype>
      </category>
      <category>
        <name>Body Control</name>
        <code>B</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Build</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Business</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Character Templates</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Character Templates - Basic Set</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Cinematic</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Combat/Weapons - Melee Combat</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Combat/Weapons - Ranged Combat</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Communication &amp; Empathy</name>
        <code>C</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Craft</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Criminal/Street</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Cultural Familiarity</name>
        <itemtype>Cultures</itemtype>
      </category>
      <category>
        <name>Design/Invention</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Earth</name>
        <code>Ea</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Enchantment</name>
        <code>En</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Esoteric</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Everyman</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Exotic</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Exotic</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Exotic Mental</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Exotic Mental</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Exotic Physical</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Exotic Physical</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Extra Arms/Legs</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Extra Arms/Legs</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Features</name>
        <itemtype>Features</itemtype>
      </category>
      <category>
        <name>Fire</name>
        <code>Fi</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Gate</name>
        <code>G</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>General</name>
        <itemtype>Quirks</itemtype>
      </category>
      <category>
        <name>General/Influence/Other Physical Features</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>General/Other Physical Features</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Healing</name>
        <code>H</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Influence</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Innate Attack</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Knowledge</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Knowledge</name>
        <code>K</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Language</name>
        <itemtype>Languages</itemtype>
      </category>
      <category>
        <name>Language Spoken</name>
        <itemtype>Languages</itemtype>
      </category>
      <category>
        <name>Language Written</name>
        <itemtype>Languages</itemtype>
      </category>
      <category>
        <name>Light &amp; Darkness</name>
        <code>L</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Medical</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Mental</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Mental</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Mental</name>
        <itemtype>Quirks</itemtype>
      </category>
      <category>
        <name>Meta-Spells</name>
        <code>Me</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Meta-Traits</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Meta-Traits - Elemental</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Meta-Traits - Machine</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Meta-Traits - Mentality</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Meta-Traits - Morphology</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Meta-Traits - Spirit</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Military</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Mind Control</name>
        <code>Mi</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Movement</name>
        <code>Mo</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Mundane</name>
        <itemtype>Languages</itemtype>
      </category>
      <category>
        <name>Mundane</name>
        <itemtype>Cultures</itemtype>
      </category>
      <category>
        <name>Mundane</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Mundane</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Mundane Mental</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Mundane Mental</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Mundane Physical</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Mundane Physical</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Mundane Social</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Mundane Social</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Natural Attacks</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Natural Sciences</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Necromancy</name>
        <code>N</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Occult/Magical</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Outdoor/Exploration</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Physical</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Physical</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Physical</name>
        <itemtype>Quirks</itemtype>
      </category>
      <category>
        <name>Plant</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Police</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Protection &amp; Warning</name>
        <code>Pr</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Racial Templates</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Racial Templates - Basic Set</name>
        <itemtype>Packages</itemtype>
      </category>
      <category>
        <name>Repair/Maintenance</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Ritual Magic Paths</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Scholarly</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Social</name>
        <itemtype>Languages</itemtype>
      </category>
      <category>
        <name>Social</name>
        <itemtype>Cultures</itemtype>
      </category>
      <category>
        <name>Social</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Social</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Social</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Social Background</name>
        <itemtype>Languages</itemtype>
      </category>
      <category>
        <name>Social Background</name>
        <itemtype>Cultures</itemtype>
      </category>
      <category>
        <name>Social Sciences/Humanities</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Spy</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Supernatural</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Supernatural</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Supernatural Mental</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Supernatural Mental</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Supernatural Physical</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Supernatural Physical</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Talents</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Talents - Powers</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Technical</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Techniques</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Techniques - Combat</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Techniques - Noncombat</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Vehicle</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Water</name>
        <code>Wa</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Wealth</name>
        <itemtype>Ads</itemtype>
      </category>
      <category>
        <name>Wealth</name>
        <itemtype>Disads</itemtype>
      </category>
      <category>
        <name>Weather</name>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>Wildcard!</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>Wildcard! - Magic</name>
        <itemtype>Skills</itemtype>
      </category>
      <category>
        <name>~Clerical</name>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Air</name>
        <code>Ai</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Body Control</name>
        <code>B</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Communication &amp; Empathy</name>
        <code>C</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Earth</name>
        <code>Ea</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Enchantment</name>
        <code>En</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Fire</name>
        <code>Fi</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Gate</name>
        <code>G</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Healing</name>
        <code>H</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Knowledge</name>
        <code>K</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Light &amp; Darkness</name>
        <code>L</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Meta-Spells</name>
        <code>Me</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Mind Control</name>
        <code>Mi</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Movement</name>
        <code>Mo</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Necromancy</name>
        <code>N</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Protection &amp; Warning</name>
        <code>Pr</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Water</name>
        <code>Wa</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Clerical - Weather</name>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual</name>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - %newspelllist%</name>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Air</name>
        <code>Ai</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Body Control</name>
        <code>B</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Communication &amp; Empathy</name>
        <code>C</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Earth</name>
        <code>Ea</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Enchantment</name>
        <code>En</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Fire</name>
        <code>Fi</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Gate</name>
        <code>G</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Healing</name>
        <code>H</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Knowledge</name>
        <code>K</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Light &amp; Darkness</name>
        <code>L</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Meta-Spells</name>
        <code>Me</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Mind Control</name>
        <code>Mi</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Movement</name>
        <code>Mo</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Necromancy</name>
        <code>N</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Protection &amp; Warning</name>
        <code>Pr</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Water</name>
        <code>Wa</code>
        <itemtype>Spells</itemtype>
      </category>
      <category>
        <name>~Ritual - Weather</name>
        <itemtype>Spells</itemtype>
      </category>
    </categories>
    <symbols count="10">
      <symbol>
        <name>mental advantage</name>
        <filename>mental_16.png</filename>
        <criteria>Advantages where cat listincludes {mental}</criteria>
        <image><![CDATA[iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAADJViUEAAAABGdBTUEAALGPC/xhBQAAAAlwSFlz
AAALDwAACw8BkvkDpQAAAAd0SU1FB+EGERIZD2I0ZEoAAAD7SURBVDhPvZI/yoNAEMU9in8KC8FK
bKwttLMRQbDwCFqJCHZWVvYexs4beJtJnmaWTXaT70sTHo8dduY3zA5rkEbLspDv+9S2Lc3zTEVR
UJ7ntO87yXVSeClJEhqGgY7jUDyOI63rKho8jktRFIlC0zQV476ua9q27WwgQMhxnLcgbFnWmW+a
5nsYRr4sSxXmZBAEWhBGvqoqFcZY/G7P8/4PY8tcIC8ONu5lOBlO0/QZdl1XwLJt2z4BngRxlmX6
N7+al8ibxsjTNKkwCnUNYIAwfh7XP45Lui3z2HAcxwKEpPASflAYhk8NGO77/jPM0k3Rdd0P4L9F
xg3BO+JKFy8frAAAAABJRU5ErkJggg==]]></image>
      </symbol>
      <symbol>
        <name>mental disadvantage</name>
        <filename>mental_16.png</filename>
        <criteria>Disadvantages where cat listincludes {mental}</criteria>
        <image><![CDATA[iVBORw0KGgoAAAANSUhEUgAAAA8AAAAQCAYAAADJViUEAAAABGdBTUEAALGPC/xhBQAAAAlwSFlz
AAALDwAACw8BkvkDpQAAAAd0SU1FB+EGERIZD2I0ZEoAAAD7SURBVDhPvZI/yoNAEMU9in8KC8FK
bKwttLMRQbDwCFqJCHZWVvYexs4beJtJnmaWTXaT70sTHo8dduY3zA5rkEbLspDv+9S2Lc3zTEVR
UJ7ntO87yXVSeClJEhqGgY7jUDyOI63rKho8jktRFIlC0zQV476ua9q27WwgQMhxnLcgbFnWmW+a
5nsYRr4sSxXmZBAEWhBGvqoqFcZY/G7P8/4PY8tcIC8ONu5lOBlO0/QZdl1XwLJt2z4BngRxlmX6
N7+al8ibxsjTNKkwCnUNYIAwfh7XP45Lui3z2HAcxwKEpPASflAYhk8NGO77/jPM0k3Rdd0P4L9F
xg3BO+JKFy8frAAAAABJRU5ErkJggg==]]></image>
      </symbol>
      <symbol>
        <name>physical advantage</name>
        <filename>physical_16.png</filename>
        <criteria>Advantages where cat listincludes {physical}</criteria>
        <image><![CDATA[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]]></image>
      </symbol>
      <symbol>
        <name>physical disadvantage</name>
        <filename>physical_16.png</filename>
        <criteria>Disadvantages where cat listincludes {physical}</criteria>
        <image><![CDATA[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]]></image>
      </symbol>
      <symbol>
        <name>social advantage</name>
        <filename>social_16.png</filename>
        <criteria>Advantages where cat listincludes {social}</criteria>
        <image><![CDATA[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
YII=]]></image>
      </symbol>
      <symbol>
        <name>social disadvantage</name>
        <filename>social_16.png</filename>
        <criteria>Disadvantages where cat listincludes {social}</criteria>
        <image><![CDATA[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
YII=]]></image>
      </symbol>
      <symbol>
        <name>exotic advantage</name>
        <filename>exotic_16.png</filename>
        <criteria>Advantages where cat listincludes {exotic}</criteria>
        <image><![CDATA[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]]></image>
      </symbol>
      <symbol>
        <name>exotic disadvantage</name>
        <filename>exotic_16.png</filename>
        <criteria>Disadvantages where cat listincludes {exotic}</criteria>
        <image><![CDATA[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]]></image>
      </symbol>
      <symbol>
        <name>supernatural advantage</name>
        <filename>supernatural_16.png</filename>
        <criteria>Advantages where cat listincludes {supernatural}</criteria>
        <image><![CDATA[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]]></image>
      </symbol>
      <symbol>
        <name>supernatural disadvantage</name>
        <filename>supernatural_16.png</filename>
        <criteria>Disadvantages where cat listincludes {supernatural}</criteria>
        <image><![CDATA[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]]></image>
      </symbol>
    </symbols>
  </character>
</gca5>`;
