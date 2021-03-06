import { BaseItemGURPS } from "@item/base";
import { baseRelativeLevel, SkillLevel } from "@item/skill/data";
import { Difficulty, gid } from "@module/data";
import { TooltipGURPS } from "@module/tooltip";
import { PrereqList } from "@prereq/prereq_list";
import { signed } from "@util";
import { SpellData } from "./data";

export class SpellGURPS extends BaseItemGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
	unsatisfied_reason = "";

	static get schema(): typeof SpellData {
		return SpellData;
	}

	get points(): number {
		return this.data.data.points;
	}

	get techLevel(): string {
		return this.data.data.tech_level;
	}

	get attribute(): string {
		return this.data.data.difficulty.split("/")[0] ?? gid.Intelligence;
	}

	get difficulty(): string {
		return this.data.data.difficulty.split("/")[1] ?? Difficulty.Average;
	}

	get powerSource(): string {
		return this.data.data.power_source;
	}

	get college(): string[] {
		return this.data.data.college;
	}

	get prereqs() {
		return new PrereqList(this.data.data.prereqs);
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	get defaultedFrom(): null {
		return null;
	}

	adjustedPoints(tooltip?: TooltipGURPS): number {
		let points = this.points;
		if (this.actor) {
			points += this.actor.bestCollegeSpellPointBonus(this.college, this.tags, tooltip);
			points += this.actor.spellPointBonusesFor(
				"spell.power_source.points",
				this.powerSource,
				this.tags,
				tooltip,
			);
			points += this.actor.spellPointBonusesFor("spell.points", this.name ?? "", this.tags, tooltip);
			points = Math.max(points, 0);
		}
		return points;
	}

	get skillLevel(): string {
		if (this.calculateLevel.level == -Infinity) return "-";
		return this.calculateLevel.level.toString();
	}

	get relativeLevel(): string {
		if (this.calculateLevel.level == -Infinity) return "-";
		return (
			(this.actor?.attributes?.get(this.attribute)?.attribute_def.name ?? "") +
			signed(this.calculateLevel.relative_level)
		);
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level;
		this.level = this.calculateLevel;
		return saved != this.level;
	}

	get calculateLevel(): SkillLevel {
		const tooltip = new TooltipGURPS();
		let relative_level = baseRelativeLevel(this.difficulty);
		let level = Math.max();
		if (this.actor) {
			let points = Math.trunc(this.points);
			level = this.actor.resolveAttributeCurrent(this.attribute);
			if (this.difficulty == Difficulty.Wildcard) points = Math.trunc(points / 3);
			if (points < 1) {
				level = Math.max();
				relative_level = 0;
			} else if (points == 1) {
			} // do nothing
			else if (points < 4) relative_level += 1;
			else relative_level += 1 + Math.trunc(points / 4);

			if (level != Math.max()) {
				relative_level += this.actor.bestCollegeSpellBonus(this.college, this.tags, tooltip);
				relative_level += this.actor.spellBonusesFor(
					"spell.power_source",
					this.powerSource,
					this.tags,
					tooltip,
				);
				relative_level += this.actor.spellBonusesFor("spell.name", this.name ?? "", this.tags, tooltip);
				relative_level = Math.trunc(relative_level);
				level += relative_level;
			}
		}
		return {
			level: level,
			relative_level: relative_level,
			tooltip: tooltip.toString(),
		};
	}
}

export interface SpellGURPS {
	readonly data: SpellData;
}
