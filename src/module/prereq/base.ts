import { CharacterGURPS } from "@actor";
import { TooltipGURPS } from "@module/tooltip";
import { Prereq, prereqClasses, PrereqType, TraitPrereq } from "@prereq";

export interface PrereqConstructionContext {
	ready?: boolean;
}

export class BasePrereq {
	type: PrereqType = "trait_prereq";
	has = true;

	constructor(data?: Prereq, context: PrereqConstructionContext = {}) {
		if (context.ready) {
			Object.assign(this, data);
		} else {
			mergeObject(context, {
				ready: true,
			});
			const PrereqConstructor = prereqClasses[data?.type as PrereqType];
			if (PrereqConstructor) return new PrereqConstructor(data as any, context);
			throw new Error("No PrereqConstructor provided");
		}
	}

	static get default() {
		return new TraitPrereq(
			{
				type: "trait_prereq",
				name: { compare: "is", qualifier: "" },
				notes: { compare: "none", qualifier: "" },
				levels: { compare: "at_least", qualifier: 0 },
				has: true,
				satisfied: () => false,
			},
			{ ready: true },
		);
	}

	satisfied(_: CharacterGURPS, __: any, ___: TooltipGURPS, ____: string): boolean {
		console.error("Cannot satisfy BasePrereq");
		return false;
	}
}
