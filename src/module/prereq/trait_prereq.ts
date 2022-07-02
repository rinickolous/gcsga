import { CharacterGURPS } from "@actor";
import { NumberCompare, StringCompare } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { BasePrereq } from "@prereq";
import { i18n, numberCompare, stringCompare } from "@util";
import { PrereqConstructionContext } from "./base";

export class TraitPrereq extends BasePrereq {
	name: StringCompare = { compare: "is", qualifier: "" };
	notes: StringCompare = { compare: "none", qualifier: "" };
	levels: NumberCompare = { compare: "at_least", qualifier: 0 };

	constructor(data: TraitPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	override satisfied(actor: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let satisfied = false;
		actor.traits.forEach(t => {
			if (exclude == t || !stringCompare(t.name, this.name)) return false;
			let notes = t.notes;
			const mod_notes = t.modifierNotes;
			if (mod_notes) notes += "\n" + mod_notes;
			if (!stringCompare(notes, this.notes)) return false;
			satisfied = numberCompare(Math.max(0, t.levels), this.levels);
			return satisfied;
		});
		if (this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prereqs.has.${this.has}`));
			tooltip.push(i18n(`gcsga.prereqs.trait.name`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.name?.compare}`));
			if (this.name?.compare != "none") tooltip.push(this.name!.qualifier!);
			if (this.notes?.compare != "none") {
				tooltip.push(i18n(`gcsga.prereqs.trait.notes`));
				tooltip.push(i18n(`gcsga.prereqs.criteria.${this.notes?.compare}`));
				tooltip.push(this.notes!.qualifier!);
				tooltip.push(",");
			}
			tooltip.push(i18n(`gcsga.prereqs.trait.level`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.levels?.compare}`));
			tooltip.push(this.levels!.qualifier.toString());
		}
		return satisfied;
	}
}

export interface TraitPrereq extends BasePrereq {
	name: StringCompare;
	levels: NumberCompare;
	notes: StringCompare;
}
