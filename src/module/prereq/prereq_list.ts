import { CharacterGURPS } from "@actor";
import { NumberCompare } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { BasePrereq, Prereq, prereqClasses, PrereqType } from "@prereq";
import { extractTechLevel, i18n, numberCompare } from "@util";
import { PrereqConstructionContext } from "./base";

export interface PrereqList extends Omit<BasePrereq, "has"> {
	prereqs: Prereq[];
	all: boolean;
}

export class PrereqList extends BasePrereq {
	prereqs: Prereq[] = [];
	all = true;
	when_tl?: NumberCompare = { compare: "none", qualifier: 0 };

	constructor(data: PrereqList, context: PrereqConstructionContext = {}) {
		super(data, context);
		if (!!(data as PrereqList).prereqs)
			(data as PrereqList).prereqs.forEach((e: Prereq) => {
				this.prereqs.push(new prereqClasses[e?.type as PrereqType](e as any, context));
			});
	}

	override satisfied(character: CharacterGURPS, exclude: any, buffer: TooltipGURPS, prefix: string): boolean {
		if (this.when_tl?.compare != "none") {
			let tl = extractTechLevel(character.profile.tech_level);
			if (tl < 0) tl = 0;
			if (!numberCompare(tl, this.when_tl)) return true;
		}
		let count = 0;
		const local = new TooltipGURPS();
		for (const p of this.prereqs) {
			if (p.satisfied(character, exclude, local, prefix)) count++;
		}
		const satisfied = count == this.prereqs.length || (!this.all && count > 0);
		if (!satisfied) {
			if (this.all) buffer.push(i18n("gcsga.prereqs.requires_all"));
			else buffer.push(i18n("gcsga.prereqs.requires_all"));
			buffer.push(local);
		}
		return satisfied;
	}
}
