import { CharacterGURPS } from "@actor";
import { ItemGURPS } from "@item/base";
import { SkillLevel } from "@item/skill/data";
import { SkillDefault } from "@item/skill/skill_default";
import { gid } from "@module/gid";
import { PrereqList } from "@module/prereq";
import { TooltipGURPS } from "@module/tooltip";
import { RitualMagicSpellData } from "./data";

//@ts-ignore
export class RitualMagicSpellGURPS extends ItemGURPS {
	points?: number;
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
	unsatisfied_reason = "";

	static get schema(): typeof RitualMagicSpellData {
		return RitualMagicSpellData;
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

	get base_skill(): string {
		return this.data.data.base_skill;
	}

	get prereq_count(): number {
		return this.data.data.prereq_count;
	}

	get difficulty(): string {
		return this.data.data.difficulty.split("/")[1];
	}

	get power_source(): string {
		return this.data.data.power_source;
	}

	ritualMagicSatisfied(tooltip: TooltipGURPS, prefix: string): boolean {
		if (this.college.length == 0) {
			tooltip.push(prefix);
			tooltip.push(`gcsga.ritual_magic_spell.must_assign_college`);
			return false;
		}
		for (const c of this.college) {
			if (this.character?.bestSkillNamed(this.base_skill, c, false, null)) return true;
		}
		if (this.character?.bestSkillNamed(this.base_skill, "", false, null)) return true;
		tooltip.push(prefix);
		tooltip.push(`gcsga.prereqs.ritual_magic.skill.name`);
		tooltip.push(this.base_skill);
		tooltip.push(` (${this.college[0]})`)
		const colleges = this.college;
		colleges.shift()
		for (const c of colleges) {
			tooltip.push(`gcsga.prereqs.ritual_magic.skill.or`);
			tooltip.push(this.base_skill)
			tooltip.push(`(${c})`);
		}
		return false;
	}

	updateLevel(): boolean {
		const saved = this.level;
		this.level = this.calculateLevel();
		return saved != this.level;
	}

	calculateLevel(): SkillLevel {
		let level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
		if (this.college.length == 0) {
			level = determineRitualMagicSkillLevelForCollege(this.character, this.name!, "", this.base_skill, this.prereq_count, this.tags, this.difficulty, this.adjustedPoints(null));
		} else {
			for (const c of this.college) {
				let possible = determineRitualMagicSkillLevelForCollege(this.character, this.name, c, this.base_skill, this.prereq_count, this.rags, this.difficulty, this.adjustedPoints(null));A
				if (level.level < possible.level) level = possible;

			}
		}
		if (this.character) {
			const tooltip = new TooltipGURPS();
			tooltip.push(level.tooltip);
			let levels = this.character.bestCollegeSpellBonus(this.tags, this.college, tooltip);
			levels += this.spellBonusesFor("spell.power_source", this.power_source, this.tags, tooltip);
			levels += this.spellBonusesFor("spell.name", this.name, this.tags, tooltip);
			levels = Math.floor(levels);
			level.level += levels;
			level.relative_level += levels;
			level.tooltip = tooltip.toString();
		}
		return level;
	}
}

export function determineRitualMagicSkillLevelForCollege(character: CharacterGURPS, name: string, college: string, base_skill: string, prereq_count: number, tags: string[], difficulty: string, points: number): SkillLevel {
	const def = new SkillDefault ({
		type: gid.Skill,
		name: base_skill,
		specialization: college,
		modifier: -prereq_count,
	});
	if (college = "") def.name = "";
	let limit = 0;
	let level = calcul
}

export interface RitualMagicSpellGURPS {
	readonly data: RitualMagicSpellData;
}
