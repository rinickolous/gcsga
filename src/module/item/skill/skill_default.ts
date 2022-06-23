import { CharacterGURPS } from "@actor";
import { SkillGURPS } from ".";

export class SkillDefault {
	type: string;
	name?: string;
	specialization?: string;
	modifier?: number;
	level?: number;
	adjusted_level?: number;
	points?: number;

	constructor(data?: SkillDefault) {
		if (data) Object.assign(this, data);
	}

	equivalent(other: SkillDefault): boolean {
		return other &&
		this.type == other.type &&
		this.modifier == other.modifier &&
		this.name == other.name &&
		this.specialization == other.specialization;
	}
	
	skillLevel(character: CharacterGURPS, require_points: boolean, excludes: Map<string, boolean>, rule_of_20: boolean): number {
		switch (this.type) {
			case "parry":
				let best = this.best(character, require_points, excludes);
				if (best != Math.max()) best = best/2 + 3 + character.calc.parry_bonus;
				return this.finalLevel(best);
			case "block":
				let best = this.best(character, require_points, excludes);
				if (best != Math.max()) best = best/2 + 3 + character.calc.block_bonus;
				return this.finalLevel(best);
			case "skill":
				return this.finalLevel(this.best(character, require_points, excludes));
			default:
				return this.skillLevelFast(character, require_points, excludes, rule_of_20);
		}
	}

	best(character: CharacterGURPS, require_points: boolean, excludes: Map<string, boolean>): number {
		let best = Math.max();
		character.skills.filter(s => s instanceof SkillGURPS, s.name == this.name, s.specialization == this.specialization
	}
}
