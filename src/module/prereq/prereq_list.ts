import { CharacterGURPS } from "@actor";
import { NumberCompare, NumberComparison } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { BasePrereq, Prereq, PrereqType } from "@prereq";
import { extractTechLevel, i18n, numberCompare } from "@util";
import { PrereqConstructionContext } from "./base";

export interface PrereqList extends Omit<BasePrereq, "has"> {
	prereqs: Prereq[];
	all: boolean;
}

export interface PrereqListObj {
	type: PrereqType;
	prereqs: Prereq[];
	all: boolean;
	when_tl?: NumberCompare;
}

export class PrereqList extends BasePrereq {
	prereqs: Prereq[] = [];
	all = true;
	when_tl?: NumberCompare = { compare: NumberComparison.None, qualifier: 0 };

	constructor(data: PrereqListObj, context: PrereqConstructionContext = {}) {
		super(data, context);
		if (!!(data as PrereqList).prereqs) {
			let list: any[] = [];
			if (Array.isArray((data as PrereqList).prereqs)) list = (data as PrereqList).prereqs;
			else {
				for (const [key, value] of Object.entries((data as PrereqList).prereqs)) {
					if (!isNaN(key as any) && !list[parseInt(key)]) list.push(value);
				}
			}
			list.forEach((e: Prereq) => {
				this.prereqs.push(new (CONFIG as any).GURPS.Prereq.classes[e?.type as PrereqType](e as any, context));
			});
		}
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
