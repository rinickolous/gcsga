import { ItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { SkillDefault } from "@item/skill/skill_default";
import { PrereqList } from "@module/prereq";
import { TooltipGURPS } from "@module/tooltip";
import { TechniqueData } from "./data";

//@ts-ignore
export class TechniqueGURPS extends ItemGURPS {
	points = 1;
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
	unsatisfied_reason = "";

	static get schema(): typeof TechniqueData {
		return TechniqueData;
	}

	get specialization(): string {
		return this.data.data.specialization;
	}

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	get tech_level(): string {
		return "";
	}

	get default(): SkillDefault {
		return this.data.data.default;
	}

	get limit(): number {
		return this.data.data.limit;
	}

	get difficulty(): string {
		return this.data.data.difficulty;
	}

	adjustedPoints(tooltip: TooltipGURPS | null): number {
		let points = this.points;
		if (this.character) {
			points += this.character.skillPointComparedBonusFor("skill.points", this.name!, this.specialization, this.tags, tooltip);
			points += this.character.bonusFor(`skills.points/${this.name}`, tooltip);
			points = Math.max(points, 0);
		}
		return points;
	}

	get calculateLevel(): SkillLevel {
		const points = this.adjustedPoints(null);
		if (!this.character) return {level: Math.max(), relative_level: Math.max(), tooltip: ""};
		return this.character.calculateTechniqueLevel(this, points);
	}

	techniqueSatisfied(tooltip: TooltipGURPS, prefix: string): boolean {
		if (this.default.type != "skill") return true;
		const sk = this.character?.bestSkillNamed(this.default.name ?? "", this.default.specialization ?? "", false, null);
		const satisfied = (sk && (sk instanceof TechniqueGURPS || sk.points > 0)) || false;
		if (!satisfied) {
			tooltip.push(prefix);
			if (!sk) tooltip.push(`gcsga.prereqs.technique.skill`);
			else tooltip.push(`gcsga.prereqs.technique.point`);
			tooltip.push(this.default.fullName(this.character!))
		}
		return satisfied;
	}

		const saved = this.level;
	updateLevel(): boolean {
		this.defaulted_from = this.bestDefaultWithPoints(null);
		this.level = this.calculateLevel;
		return saved != this.level;
	}
}

export interface TechniqueGURPS {
	readonly data: TechniqueData;
}
