import { BaseItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { TooltipGURPS } from "@module/tooltip";
import { RitualMagicSpellData } from "./data";

export class RitualMagicSpellGURPS extends BaseItemGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };

	static get schema(): typeof RitualMagicSpellData {
		return RitualMagicSpellData;
	}

	// Getters
	get college(): string[] {
		return this.data.data.college;
	}

	get baseSkill(): string {
		return this.data.data.base_skill;
	}

	get prereqs() {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	satisfied(tooltip: TooltipGURPS, prefix: string): boolean {
		if (this.college.length == 0) {
			tooltip.push(prefix);
			tooltip.push(`gcsga.ritual_magic_spell.must_assign_college`);
			return false;
		}
		for (const c of this.college) {
			if (this.actor?.bestSkillNamed(this.baseSkill, c, false, null)) return true;
		}
		if (this.actor?.bestSkillNamed(this.baseSkill, "", false, null)) return true;
		tooltip.push(prefix);
		tooltip.push(`gcsga.prereqs.ritual_magic.skill.name`);
		tooltip.push(this.baseSkill);
		tooltip.push(` (${this.college[0]})`);
		const colleges = this.college;
		colleges.shift();
		for (const c of colleges) {
			tooltip.push(`gcsga.prereqs.ritual_magic.skill.or`);
			tooltip.push(this.baseSkill);
			tooltip.push(`(${c})`);
		}
		return false;
	}
}

export interface RitualMagicSpellGURPS {
	readonly data: RitualMagicSpellData;
}
