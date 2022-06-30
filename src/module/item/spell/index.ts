import { BaseItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { TooltipGURPS } from "@module/tooltip";
import { SpellData } from "./data";

export class SpellGURPS extends BaseItemGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };

	static get schema(): typeof SpellData {
		return SpellData;
	}

	get points(): number {
		return this.data.data.points;
	}

	get attribute(): string {
		return this.data.data.difficulty.split("/")[0] ?? "dx";
	}

	get difficulty(): string {
		return this.data.data.difficulty.split("/")[1] ?? "a";
	}

	get powerSource(): string {
		return this.data.data.power_source;
	}

	get college(): string[] {
		return this.data.data.college;
	}

	get prereqs() {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	get defaultedFrom(): null {
		return null;
	}

	get adjustedPoints(): number {
		let points = this.points;
		const tooltip = new TooltipGURPS();
		if (this.actor) {
			points += this.actor.bestCollegeSpellPointBonus(this.college, this.tags, tooltip);
			points += this.actor.spellPointBonusesFor(
				"spell.power_source.points",
				this.powerSource,
				this.tags,
				tooltip,
			);
			points += this.actor.spellPointBonusesFor("spell.points", this.name, this.tags, tooltip);
			points = Math.max(points, 0);
		}
		return points;
	}

	// Point & Level Manipulation
	updateLevel(): boolean {
		const saved = this.level;
		this.level = this.actor?.calculateSpellLevel(this, this.adjustedPoints);
		return saved != this.level;
	}
}

export interface SpellGURPS {
	readonly data: SpellData;
}
