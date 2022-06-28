import { CharacterGURPS } from "@actor";
import { SkillGURPS, TechniqueGURPS } from "@item";
import { gid } from "@module/gid";

const skill_based_default_types: Map<string, boolean> = new Map();
skill_based_default_types.set(gid.Skill, true);
skill_based_default_types.set(gid.Parry, true);
skill_based_default_types.set(gid.Block, true);


export class SkillDefault {
	type = "skill";
	name?: string;
	specialization?: string;
	modifier = 0;
	level = 0;
	adjusted_level = 0;
	points = 0;

	constructor(data?: SkillDefaultDef) {
		if (data) Object.assign(this, data);
	}

	get skill_based(): boolean {
		return skill_based_default_types.get(this.type) ?? false;
	}

	equivalent(other: SkillDefault): boolean {
		return (
			other &&
			this.type == other.type &&
			this.modifier == other.modifier &&
			this.name == other.name &&
			this.specialization == other.specialization
		);
	}

	fullName(character: CharacterGURPS): string {
		if (this.skill_based) {
			let buffer = "";
			buffer += this.name;
			if (this.specialization) buffer += ` (${this.specialization})`;
			if (this.type == gid.Dodge) buffer += " Dodge";
			else if (this.type == gid.Parry) buffer += " Parry";
			else if (this.type == gid.Block) buffer += " Block";
			return buffer;

		}
		return character.resolveAttributeName(this.type);
	}

	skillLevel(
		character: CharacterGURPS,
		require_points: boolean,
		excludes: Map<string, boolean>,
		rule_of_20: boolean,
	): number {
		let best = Math.max();
		switch (this.type) {
			case "parry":
				best = this.best(character, require_points, excludes);
				if (best != Math.max()) best = best / 2 + 3 + character.calc.parry_bonus;
				return this.finalLevel(best);
			case "block":
				best = this.best(character, require_points, excludes);
				if (best != Math.max()) best = best / 2 + 3 + character.calc.block_bonus;
				return this.finalLevel(best);
			case "skill":
				return this.finalLevel(this.best(character, require_points, excludes));
			default:
				return this.skillLevelFast(character, require_points, excludes, rule_of_20);
		}
	}

	best(character: CharacterGURPS, require_points: boolean, excludes: Map<string, boolean>): number {
		let best = Math.max();
		character.skillNamed(this.name!, this.specialization || "", require_points, excludes).forEach((s) => {
			let level = s.calculateLevel.level;
			if (best < level) best = level;
		});
		return best;
	}

	skillLevelFast(
		character: CharacterGURPS,
		require_points: boolean,
		excludes: Map<string, boolean> = new Map(),
		rule_of_20: boolean,
	): number {
		let level = 0;
		let best = 0;
		switch (this.type) {
			case gid.Dodge:
				level = character.dodge(character.encumbranceLevel(true));
				if (rule_of_20 && level > 20) level = 20;
				return this.finalLevel(level);
			case gid.Parry:
				best = this.bestFast(character, require_points, excludes);
				if (best != Math.max()) best = Math.floor(best / 2) + 3 + character.calc.parry_bonus;
				return this.finalLevel(best);
			case gid.Block:
				best = this.bestFast(character, require_points, excludes);
				if (best != Math.max()) best = Math.floor(best / 2) + 3 + character.calc.block_bonus;
				return this.finalLevel(best);
			case gid.Skill:
				return this.finalLevel(this.bestFast(character, require_points, excludes));
			default:
				level = character.resolveAttributeCurrent(this.type);
				if (rule_of_20) level = Math.min(level, 20);
				return this.finalLevel(level);
		}
	}

	bestFast(character: CharacterGURPS, require_points: boolean, excludes: Map<string, boolean>): number {
		let best = Math.max();
		character.skillNamed(this.name!, this.specialization || "", require_points, excludes).forEach((sk) => {
			sk = sk as SkillGURPS | TechniqueGURPS;
			if (best < sk.level.level) best = sk.level.level;
		});
		return best;
	}

	finalLevel(level: number): number {
		if (level != Math.max()) level += this.modifier;
		return level;
	}

	get noLevelOrPoints(): SkillDefault {
		return new SkillDefault({
			type: this.type,
			name: this.name,
			modifier: this.modifier,
			level: 0,
			adjusted_level: 0,
			points: 0,
		});
	}
}

export interface SkillDefaultDef {
	type: SkillDefaultType;
	name?: string;
	specialization?: string;
	modifier: number;
	level?: number;
	adjusted_level?: number;
	points?: number;
}

export type SkillDefaultType = "block" | "parry" | "skill" | "10" | string;
