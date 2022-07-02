import { CharacterGURPS } from "@actor";
import { RitualMagicSpellGURPS, SpellContainerGURPS, SpellGURPS } from "@item";
import { NumberCompare, StringCompare } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { BasePrereq } from "@prereq";
import { numberCompare, stringCompare } from "@util";
import { PrereqConstructionContext } from "./base";

export type SpellPrereqSubType = "name" | "any" | "college" | "college_count" | "tag";

export interface SpellPrereq extends BasePrereq {
	quantity: NumberCompare;
	sub_type: SpellPrereqSubType;
	qualifier: StringCompare;
}

export class SpellPrereq extends BasePrereq {
	quantity: NumberCompare = { compare: "at_least", qualifier: 1 };
	sub_type: SpellPrereqSubType = "name";
	qualifier: StringCompare = { compare: "is", qualifier: "" };

	constructor(data: SpellPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let tech_level = "";
		if (exclude instanceof SpellGURPS || exclude instanceof RitualMagicSpellGURPS) tech_level = exclude.techLevel;
		let count = 0;
		const colleges: Map<string, boolean> = new Map();
		character.spells.forEach(sp => {
			if (sp instanceof SpellContainerGURPS) return;
			sp = sp as SpellGURPS | RitualMagicSpellGURPS;
			if (exclude == sp || sp.points == 0) return;
			if (tech_level && sp.techLevel && tech_level != sp.techLevel) return false;
			switch (this.sub_type) {
				case "name":
					if (stringCompare(sp.name, this.qualifier)) count++;
					return;
				case "tag":
					if (stringCompare(sp.tags, this.qualifier)) count++;
					break;
				case "college":
					if (stringCompare(sp.college, this.qualifier)) count++;
					break;
				case "college_count":
					for (const c of sp.college) colleges.set(c, true);
					break;
				case "any":
					count++;
					break;
			}
		});
		if (this.sub_type == "college_count") count = colleges.entries.length;
		let satisfied = numberCompare(count, this.quantity);
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(`gcsga.prereqs.has.${this.has}`);
			if (this.sub_type == "college_count") {
				tooltip.push(`gcsga.prereqs.spell.college_count`);
				tooltip.push(`gcsga.prereqs.criteria.${this.quantity.compare}`);
				tooltip.push(this.quantity.compare.toString());
			} else {
				tooltip.push(" ");
				tooltip.push(`gcsga.prereqs.criteria.${this.quantity.compare}`);
				if (this.quantity.qualifier == 1) tooltip.push(`gcsga.prereqs.spell.one`);
				else tooltip.push(`gcsga.prereqs.spell.many`);
				tooltip.push(" ");
				if (this.sub_type == "any") tooltip.push(`gcsga.prereqs.spell.any`);
				else {
					if (this.sub_type == "name") tooltip.push(`gcsga.prereqs.spell.name`);
					else if (this.sub_type == "tag") tooltip.push(`gcsga.prereqs.spell.tag`);
					else if (this.sub_type == "college") tooltip.push(`gcsga.prereqs.spell.college`);
					tooltip.push(`gcsga.prereqs.criteria.${this.qualifier.compare}`);
					tooltip.push(this.qualifier.qualifier!);
				}
			}
		}
		return satisfied;
	}
}
