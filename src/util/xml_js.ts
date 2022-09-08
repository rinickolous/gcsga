import { i18n } from "./misc";

/**
 * Convert raw GCA5 XML data to a JS object
 * @param {string} xml
 */
export function XMLtoJS(xml: string) {
	xml = xml.replace(/\\/g, "\\\\");
	return parseXml(xml, [
		"damagebreaks",
		"modifier",
		"trait",
		"bonus",
		"groupitem",
		"attackmode",
		"extendedtag",
		"bonuslist",
	]);
}

/**
 * Parse XML data and convert to JS object
 * @param {string} xml
 * @param {string[]} arrayTags
 */
function parseXml(xml: string, arrayTags: string[]) {
	if (!window.DOMParser) throw new Error(i18n("gurps.error.import.cannot_parse_xml"));
	const dom = new DOMParser().parseFromString(xml, "text/xml");

	/**
	 * Parse individual XML node to JS object
	 * @param {Record<string, any>} xmlNode
	 * @param {Record<string, any>} result
	 * @param {string} parent
	 */
	function parseNode(xmlNode: Record<string, any>, result: Record<string, any>, parent = ""): void {
		if (xmlNode.nodeName === "#text") {
			const v = xmlNode.nodeValue;
			if (v.trim()) result["#text"] = v;
			return;
		}

		const jsonNode: any = {};
		const existing = result[xmlNode.nodeName];
		if (existing) {
			if (!Array.isArray(existing)) result[xmlNode.nodeName] = [existing, jsonNode];
			else result[xmlNode.nodeName].push(jsonNode);
		} else if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) !== -1) result[xmlNode.nodeName] = [jsonNode];
		else {
			result[xmlNode.nodeName] = jsonNode;
		}

		if (xmlNode.attributes) {
			for (const attribute of xmlNode.attributes) {
				jsonNode[`@${attribute.nodeName}`] = attribute.nodeValue;
			}
		}

		if (xmlNode.childNodes.length === 0 && parent !== "traits") result[xmlNode.nodeName] = "";
		for (const node of xmlNode.childNodes) {
			if (node.nodeName === "#text" && node.nodeValue.trim()) result[xmlNode.nodeName] = node.nodeValue.trim();
			else if (node.nodeName === "#cdata-section") result[xmlNode.nodeName] = node.nodeValue;
			else parseNode(node, jsonNode, xmlNode.nodeName);
		}
	}

	const result: any = {};
	// HACK: as any
	if (dom) for (const node of dom.childNodes as any) parseNode(node, result);

	return result;
}
