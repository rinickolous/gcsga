import { CharacterGURPS } from "@actor";
import { EquipmentContainerGURPS, EquipmentGURPS } from "@item";
import { NumberCompare, NumberComparison } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { BasePrereq } from "@prereq";
import { i18n, numberCompare } from "@util";
import { PrereqConstructionContext } from "./base";

export interface ContainedWeightPrereq extends BasePrereq {
	qualifier: NumberCompare;
}

export class ContainedWeightPrereq extends BasePrereq {
	qualifier: NumberCompare = { compare: NumberComparison.AtMost, qualifier: 5 };

	constructor(data: ContainedWeightPrereq, context: PrereqConstructionContext = {}) {
		super(data, context);
	}

	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean {
		let satisfied = false;
		const eqp = exclude as EquipmentGURPS | EquipmentContainerGURPS;
		if (eqp) {
			satisfied = !(eqp instanceof EquipmentContainerGURPS);
			if (!satisfied) {
				const units = character.settings.default_weight_units;
				const weight = eqp.extendedWeight(false, units) - eqp.adjustedWeight(false, units);
				satisfied = numberCompare(weight, this.qualifier);
			}
		}
		if (!this.has) satisfied = !satisfied;
		if (!satisfied) {
			tooltip.push(prefix);
			tooltip.push(i18n(`gcsga.prerqs.has.${this.has}`));
			tooltip.push(i18n(`gcsga.prereqs.weight`));
			tooltip.push(i18n(`gcsga.prereqs.criteria.${this.qualifier?.compare}`));
			tooltip.push(this.qualifier!.qualifier.toString());
		}
		return satisfied;
	}
}
