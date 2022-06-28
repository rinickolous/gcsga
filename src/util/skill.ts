import { CharacterGURPS } from "@actor";
import { SkillLevel } from "@item/skill/data";
import { SkillDefault } from "@item/skill/skill_default";
import { TooltipGURPS } from "@module/tooltip";
import { i18n_f, signed } from "@util";

export function CalculateSkillLevel(entity: CharacterGURPS | null, name: string, specialization: string, tags: string[], def: SkillDefault, difficulty: AttributeDifficulty, points: number, encumbrance_penalty_multiplier: number): SkillLevel {
	let tooltip = new TooltipGURPS();
	let relative_level = BaseRelativeLevel(difficulty.difficulty);
	let level = entity?.ResolveAttributeCurrent(difficulty.attribute);
	if (level != Math.max()) {
		if (difficulty.difficulty == Difficulty.Wildcard) points /= 3;
		else if (def && def.points > 0) points += def.points;
		points = Math.trunc(points);
		if (points == 1) {} // relative_level is preset to this point value
		else if (points > 1 && points < 4) relative_level += 1;
		else if (points > 4) relative_level += 1 + Math.trunc(points / 4);
		else if (difficulty.difficulty != Difficulty.Wildcard && def && def.points < 0) relative_level = def.adjusted_level - level;
		else {
			level = Math.max();
			relative_level = 0;
		}
		if (level != Math.max()) {
			level += relative_level;
			if (difficulty.difficulty != Difficulty.Wildcard && def && level < def.adjusted_level) level = def.adjusted_level;
			if (entity) {
				let bonus = entity.SkillComparedBonusFor("skill.name*", name, specialization, tags, tooltip);
				level += bonus;
				relative_level += bonus;
				bonus = entity.BonusFor("skill.name/"+name.toLowerCase(), tooltip);
				level += bonus;
				relative_level += bonus;
				bonus = entity.EncumbranceLevel(true).penalty * encumbrance_penalty_multiplier;
				level += bonus;
				if (bonus != 0) {
					tooltip.push(i18n_f("gcsga.tooltip.encumbrance", {bonus: signed(bonus)}));
				}
			}
		}
	}
	return {
		level: level,
		relative_level: relative_level,
		tooltip: tooltip.toString()
	}
	// let tooltip = new TooltipGURPS();
	// let relative_level = SkillGURPS.BaseRelativeLevel(difficulty.difficulty);
	// let level = this.resolveAttributeCurrent(difficulty.attribute);
	// if (level != Math.max()) {
	// 	if (difficulty.difficulty == "w") {
	// 		points /= 3;
	// 	} else if (def && def.points > 0) {
	// 		points += def.points;
	// 	}
	// 	points = Math.floor(points);
	// 	if (points == 1) {
	// 		// relative_level is preset to this point value
	// 	} else if (points > 1 && points < 4) {
	// 		relative_level += 1;
	// 	} else if (points > 4) {
	// 		relative_level += 1 + Math.floor(points / 4);
	// 	} else if (difficulty != "w" && !!def && def.points < 0) {
	// 		relative_level = def.adjusted_level - level;
	// 	} else {
	// 		level = Math.max();
	// 		relative_level = 0;
	// 	}
	// }
	// if (level != Math.max()) {
	// 	level += relative_level;
	// 	if (difficulty.difficulty != "w" && !!def && level < def.adjusted_level) {
	// 		level = def.adjusted_level;
	// 	}
	// 	let [bonus, tooltip] = this.skillComparedBonusFor(skill);
	// 	level += bonus;
	// 	relative_level += bonus;
	// 	bonus = entity.encumbrance_penalty * encumbrance_penalty_multiplier;
	// 	level += bonus;
	// 	relative_level += bonus;
	// 	if (bonus != 0) {
	// 		tooltip.push({ name: i18n("gcsga.encumbrance"), amount: bonus });
	// 	}
	// }
	// return {
	// 	level: level,
	// 	relative_level: relative_level,
	// 	tooltip: tooltip.toString(),
	// };
}

export function CalculateTechniqueLevel(entity: CharacterGURPS | null, name: string, specialization: string, tags: string[], def: SkillDefault, difficulty: AttributeDifficulty, require_points: boolean, limit_modifier: number): SkillLevel {

}

export function CalculateSpellLevel(entity: CharacterGURPS | null, name: string, power_source: string, colleges: string[], tags: string[], difficulty: AttributeDifficulty, points: number): SkillLevel {

}

export function CalculateRitualMagicSpellLevel(entity: CharacterGURPS | null, name: string, power_source: string, base_skill: string, prereq_count: number, colleges: string[], tags: string[], difficulty: AttributeDifficulty, points: number): SkillLevel {

}

export function determineRitualMagicSpellLevelForCollege(entity: CharacterGURPS | null, name: string, college: string, base_skill: string, prereq_count: number, tags: string[], difficulty: AttributeDifficulty, points: number): SkillLevel {

}

// Bonuses
export function SkillComparedBonusFor(id: string, name: string, specialization: string, tags: string[], tooltip: TooltipGURPS | null): number {

}

export function SkillPointComparedBonusFor(id: string, name: string, specialization: string, tags: string[], tooltip: TooltipGURPS | null): number {

}


export function SpellPointBonusFor(id: string, name: string, tags: string[], tooltip: TooltipGURPS | null): number {

}

export function SpellPointComparedBonusFor(id: string, name: string, tags: string[], tooltip: TooltipGURPS | null): number {

}

export function NamedWeaponDamageBonusesFor(id: string, name: string, usage: string, tags: string[], die_count: number, tooltip: TooltipGURPS): WeaponDamageBonus[] {

}

export function NamedWeaponSkillBonusesFor(id: string, name: string, usage: string, tags: string[], tooltip: TooltipGURPS): SkillBonus[] {

}
