import { CharacterGURPS } from "@actor";
import { NumberComparison, StringComparison } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { Prereq, PrereqList, PrereqType, TraitPrereq } from "@prereq";

export interface PrereqConstructionContext {
	ready?: boolean;
}

export class BasePrereq {
	type: PrereqType = "trait_prereq";
	has = true;

	constructor(data?: Prereq | any, context: PrereqConstructionContext = {}) {
		if (context.ready) {
			Object.assign(this, data);
		} else {
			mergeObject(context, {
				ready: true,
			});
			const PrereqConstructor = (CONFIG as any).GURPS.Prereq.classes[data?.type as PrereqType];
			if (PrereqConstructor) return new PrereqConstructor(data as any, context);
			throw new Error("No PrereqConstructor provided");
		}
	}

	static get default() {
		return new TraitPrereq(
			{
				type: "trait_prereq",
				name: { compare: StringComparison.Is, qualifier: "" },
				notes: { compare: StringComparison.None, qualifier: "" },
				levels: { compare: NumberComparison.AtLeast, qualifier: 0 },
				has: true,
				satisfied: () => false,
			},
			{ ready: true },
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
}
