import { CharacterGURPS } from "@actor";
import { NumberComparison, StringComparison } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import {
	AttributePrereq,
	ContainedQuantityPrereq,
	ContainedWeightPrereq,
	PrereqList,
	SkillPrereq,
	SpellPrereq,
	TraitPrereq,
} from "@prereq";

export interface PrereqConstructionContext {
	ready?: boolean;
}

export type PrereqType =
	| "prereq_list"
	| "trait_prereq"
	| "attribute_prereq"
	| "contained_quantity_prereq"
	| "contained_weight_prereq"
	| "skill_prereq"
	| "spell_prereq";

export type Prereq =
	| PrereqList
	| TraitPrereq
	| AttributePrereq
	| ContainedWeightPrereq
	| ContainedQuantityPrereq
	| SkillPrereq
	| SpellPrereq;

export class BasePrereq {
	constructor(data: Prereq | any, context: PrereqConstructionContext = {}) {
		if (context.ready) {
			// Do nothing
		} else {
			mergeObject(context, {
				ready: true,
			});
			const PrereqConstructor = (CONFIG as any).GURPS.Prereq.classes[data?.type as PrereqType];
			if (PrereqConstructor) return new PrereqConstructor(data as any, context);
			throw new Error("No PrereqConstructor provided");
		}
	}

	static get defaults(): Record<string, any> {
		return {
			has: true,
		};
	}

	static get default() {
		return new TraitPrereq(
			{
				type: "trait_prereq",
				name: { compare: StringComparison.Is, qualifier: "" },
				notes: { compare: StringComparison.None, qualifier: "" },
				levels: { compare: NumberComparison.AtLeast, qualifier: 0 },
				has: true,
			},
			{ ready: true }
		);
	}

	static get list() {
		return new PrereqList({
			type: "prereq_list",
			all: true,
			when_tl: { compare: NumberComparison.None, qualifier: 0 },
			prereqs: [],
		});
	}
}

export interface BasePrereq {
	satisfied(character: CharacterGURPS, exclude: any, tooltip: TooltipGURPS, prefix: string): boolean;
	type: PrereqType;
	has: boolean;
}
