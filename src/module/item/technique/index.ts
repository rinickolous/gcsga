import { BaseItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { gid } from "@module/data";
import { SkillDefault } from "@module/skill-default";
import { TooltipGURPS } from "@module/tooltip";
import { PrereqList } from "@prereq/prereq_list";
import { signed } from "@util";
import { TechniqueData } from "./data";

export class TechniqueGURPS extends BaseItemGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
	unsatisfied_reason = "";

	static get schema(): typeof TechniqueData {
		return TechniqueData;
	}

	// Getters
	get points(): number {
		return this.data.data.points;
	}

	get techLevel(): string {
		return this.data.data.tech_level;
	}

	get specialization(): string {
		return "";
	}

	get limit(): number {
		return this.data.data.limit;
	}

	get difficulty(): string {
		return this.data.data.difficulty;
	}

	get defaultedFrom(): SkillDefault | undefined {
		return this.data.data.defaulted_from;
	}
	set defaultedFrom(v: SkillDefault | undefined) {
		this.data.data.defaulted_from = v;
	}

	get default(): SkillDefault {
		return new SkillDefault(this.data.data.default);
	}

	get features() {
		return this.data.data.features;
	}

	get prereqs() {
		return new PrereqList(this.data.data.prereqs);
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

	get skillLevel(): string {
		if (this.calculateLevel.level == -Infinity) return "-";
		return this.calculateLevel.level.toString();
	}

	get relativeLevel(): string {
		if (this.calculateLevel.level == -Infinity) return "-";
		return signed(this.calculateLevel.relative_level);
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level;
		this.defaultedFrom = undefined;
		this.level = this.calculateLevel;
		return saved != this.level;
	}

	get calculateLevel(): SkillLevel {
		const tooltip = new TooltipGURPS();
		let relative_level = 0;
		let points = this.adjustedPoints(null);
		let level = Math.max();
		if (this.actor) {
			if (this.default?.type == gid.Skill) {
				const sk = this.actor.baseSkill(this.default!, true);
				if (sk) level = sk.calculateLevel.level;
			} else if (this.default) {
				level = this.default?.skillLevelFast(this.actor, true, null, false) - this.default?.modifier;
			}
			if (level != Math.max()) {
				const base_level = level;
				level += this.default.modifier;
				if (this.difficulty == "h") points -= 1;
				if (points > 0) relative_level = points;
				if (level != Math.max()) {
					relative_level += this.actor.bonusFor("skill.name/" + this.name, tooltip);
					relative_level += this.actor.skillComparedBonusFor(
						"skill.name*",
						this.name ?? "",
						this.specialization,
						this.tags,
						tooltip,
					);
					level += relative_level;
				}
				if (!!this.limit) {
					const max = base_level + this.limit;
					if (level > max) {
						relative_level -= level - max;
						level = max;
					}
				}
			}
		}
		return {
			level: level,
			relative_level: relative_level,
			tooltip: tooltip.toString(),
		};
	}
}

export interface TechniqueGURPS {
	readonly data: TechniqueData;
}
