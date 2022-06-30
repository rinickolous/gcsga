import { CharacterGURPS } from "@actor";
import { NumberCompare } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { BasePrereq } from "@prereq";
import { i18n, numberCompare } from "@util";
import { PrereqConstructionContext } from "./base";

export class AttributePrereq extends BasePrereq {
	which = "st";
	combined_with = "";
	qualifier: NumberCompare = { compare: "at_least", qualifier: 10 };

	constructor(data: AttributePrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, _: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let value = character.resolveAttributeCurrent(this.which);
		if (this.combined_with != "") value += character.resolveAttributeCurrent(this.combined_with);
		let satisfied = numberCompare(value, this.qualifier);
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prerqs.has.${this.has}`));
			tooltip.push(" ");
			tooltip.push(character.resolveAttributeName(this.which));
			if (this.combined_with != "") {
				tooltip.push(i18n(`gcsga.prereqs.attribute.plus`));
				tooltip.push(character.resolveAttributeName(this.combined_with));
			}
			tooltip.push(i18n(`gcsga.prereqs.attribute.which`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.qualifier?.compare}`));
			tooltip.push(this.qualifier!.qualifier.toString());
		}
		return satisfied;
	}
}

export interface AttributePrereq extends BasePrereq {
	which: string;
	combined_with: string;
	qualifier: NumberCompare;
}
