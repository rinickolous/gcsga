import { ItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { PrereqList } from "@module/prereq";
import { SpellData } from "./data";

//@ts-ignore
export class SpellGURPS extends ItemGURPS {
	points: number = 0;
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
	unsatisfied_reason = "";

	static get schema(): typeof SpellData {
		return SpellData;
	}

	get tech_level(): string {
		return this.data.data.tech_level;
	}

	get college(): string[] {
		return this.data.data.college;
	}

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	get adjusted_points(): number {
		let points = this.points;
		if (this.character) {
			points += this.character.bestCollegeSpellPointBonus(this.college, this.tags, tooltip);
		}
	}

	updateLevel(): boolean {
		const saved = this.level;
		this.level = this.character?.calculateSpellLevel(this, this.adjusted_points);
		return saved != this.level;
	}
}

export interface SpellGURPS {
	readonly data: SpellData;
}
