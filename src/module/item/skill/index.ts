import { CharacterGURPS } from "@actor";
import { Default, DefaultedFrom } from "@module/data";
import { ItemGURPS } from "../base";
import { SkillData, SkillLevel } from "./data";

//@ts-ignore
export class SkillGURPS extends ItemGURPS {
	points?: number;
	level?: SkillLevel;

	static get schema(): typeof SkillData {
		return SkillData;
	}

	static baseRelativeLevel(d: string): number {
		switch (d) {
			case "e":
				return 0;
			case "a":
				return -1;
			case "h":
				return -2;
			case "w":
				return -3;
			default:
				return this.baseRelativeLevel("e");
		}
	}

	get attribute(): string {
		return this.data.data.difficulty.split("/")[0] ?? "dx";
	}

	get difficulty(): string {
		return this.data.data.difficulty.split("/")[1] ?? "a";
	}

	get specialization(): string {
		return this.data.data.specialization ?? "";
	}

	get defaulted_from(): DefaultedFrom {
		return this.data.data.defaulted_from;
	}

	get encumbrance_penalty_multiplier(): number {
		return this.data.data.encumbrance_penalty_multiplier;
	}

	bestDefaultWithPoints(character: CharacterGURPS, excluded: Default): DefaultedFrom | null {
		let best = this.bestDefault(character, excluded);
		if (best) {
			const baseline = character.attributes[this.attribute].calc.value + SkillGURPS.baseRelativeLevel(this.difficulty);
			let level = best.level;
			best.adjusted_level = level;
			if (level == baseline) best.points = 1;
			else if (level == baseline + 1) best.points = 2;
			else if (level > baseline + 1) best.points = 4*(level - (baseline + 1));
			else best.points = -Math.max(level, 0);
		}
		return best;
	}

	bestDefault(character: CharacterGURPS, excluded: Default): DefaultedFrom | null {
		if (!character || this.data.data.defaults.length == 0) return null;
		const excludes = new Map();
		excludes.set(this.name!, true);
		let bestDef: Default;
		let best = Math.max();
		for (const def of this.data.data.defaults) {
			if (this.equivalent(def, excluded) || this.inDefaultChain(character, def, new Map())) continue;
			let level = def.
		}
	}

	equivalent(def: Default, other: Default): boolean {
		return other != null &&
			def.type == other.type &&
			def.modifier == other.modifier &&
			def.name == other.name &&
			def.specialization == other.specialization;
	}

	inDefaultChain(character: CharacterGURPS, def: Default, lookedAt: Map<string, boolean>): boolean {
		if (!character || !def || !def.name) return false;
		let hadOne = false;
		for (const one of (character.skills as Collection<SkillGURPS>).filter(s => s.name == def.name && s.specialization == def.specialization)) {
			if (one == this) return true;
			if (typeof one.id == "string" && lookedAt.get(one.id)) {
				lookedAt.set(one.id, true);
				if (this.inDefaultChain(character, one.defaulted_from, lookedAt)) return true;
			}
			hadOne = true;
		}
		return !hadOne;
	}


}

export interface SkillGURPS {
	readonly data: SkillData;
}
