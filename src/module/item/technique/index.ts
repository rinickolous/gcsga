import { BaseItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { SkillDefault } from "@module/skill-default";
import { TooltipGURPS } from "@module/tooltip";
import { TechniqueData } from "./data";

export class TechniqueGURPS extends BaseItemGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };

	static get schema(): typeof TechniqueData {
		return TechniqueData;
	}

	// Getters
	get points(): number {
		return this.data.data.points;
	}

	get difficulty(): string {
		return this.data.data.difficulty;
	}

	get defaultedFrom(): SkillDefault | null {
		return this.data.data.defaulted_from;
	}
	set defaultedFrom(v: SkillDefault | null) {
		this.data.data.defaulted_from = v;
	}

	get default(): SkillDefault {
		return this.data.data.default;
	}

	get features() {
		return this.data.data.features;
	}

	get prereqs() {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	adjustedPoints(tooltip: TooltipGURPS | null): number {
		let points = this.points;
		if (this.actor) {
			points += this.actor.skillPointComparedBonusFor("skill.points", this.name!, "", this.tags, tooltip);
			points += this.actor.bonusFor(`skills.points/${this.name}`, tooltip);
			points = Math.max(points, 0);
		}
		return points;
	}

	satisfied(tooltip: TooltipGURPS, prefix: string): boolean {
		if (this.default.type != "skill") return true;
		const sk = this.actor?.bestSkillNamed(this.default.name ?? "", this.default.specialization ?? "", false, null);
		const satisfied = (sk && (sk instanceof TechniqueGURPS || sk.points > 0)) || false;
		if (!satisfied) {
			tooltip.push(prefix);
			if (!sk) tooltip.push(`gcsga.prereqs.technique.skill`);
			else tooltip.push(`gcsga.prereqs.technique.point`);
			tooltip.push(this.default.fullName(this.actor!));
		}
		return satisfied;
	}

	// Point & Level Manipulation
	get calculateLevel(): SkillLevel {
		const points = this.adjustedPoints(null);
		if (!this.actor) return { level: Math.max(), relative_level: Math.max(), tooltip: "" };
		return this.actor.calculateSkillLevel(this, points);
	}

	updateLevel(): boolean {
		this.defaultedFrom = this.bestDefaultWithPoints(null);
		this.level = this.calculateLevel;
		return saved != this.level;
	}
}

export interface TechniqueGURPS {
	readonly data: TechniqueData;
}
