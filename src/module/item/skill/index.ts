import { CharacterGURPS } from "@actor";
import { PrereqList } from "@module/prereq";
import { TooltipGURPS } from "@module/tooltip";
import { ItemGURPS } from "../base";
import { SkillData, SkillLevel } from "./data";
import { SkillDefault } from "./skill_default";

//@ts-ignore
export class SkillGURPS extends ItemGURPS {
	points: number = 1;
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };
	unsatisfied_reason = "";

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

	get tech_level(): string {
		return this.data.data.tech_level;
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

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	get defaulted_from(): SkillDefault {
		return this.data.data.defaulted_from;
	}
	set defaulted_from(v: SkillDefault | null) {
		this.data.data.defaulted_from = v;
	}

	get encumbrance_penalty_multiplier(): number {
		return this.data.data.encumbrance_penalty_multiplier;
	}

	get calculateLevel(): SkillLevel {
		const points = this.adjustedPoints(null);
		if (!this.character) return {level: Math.max(), relative_level: Math.max(), tooltip: ""};
		return this.character.calculateSkillLevel(this, points);
	}


	adjustedPoints(tooltip: TooltipGURPS | null): number {
		let points = this.points;
		if (this.character) {
			points += this.character.skillPointComparedBonusFor("skill.points", this.name!, this.specialization, this.tags, tooltip);
			points += this.character.bonusFor(`skills.points/${this.name}`, tooltip);
			points = Math.max(points, 0);
		}
		return points;
	}

	bestDefaultWithPoints(excluded: SkillDefault | null): SkillDefault | null {
		if (!this.character) return null;
		let best = this.bestDefault(excluded);
		if (best) {
			const baseline = this.character.resolveAttributeCurrent(this.attribute) + SkillGURPS.baseRelativeLevel(this.difficulty);
			let level = best.level;
			best.adjusted_level = level;
			if (level == baseline) best.points = 1;
			else if (level == baseline + 1) best.points = 2;
			else if (level > baseline + 1) best.points = 4 * (level - (baseline + 1));
			else best.points = -Math.max(level, 0);
		}
		return best;
	}

	bestDefault(excluded: SkillDefault | null): SkillDefault | null {
		if (!this.character || this.data.data.defaults.length == 0) return null;
		const excludes = new Map();
		excludes.set(this.name!, true);
		let bestDef = new SkillDefault();
		let best = Math.max();
		for (const def of this.data.data.defaults) {
			if (this.equivalent(def, excluded) || this.inDefaultChain(this.character, def, new Map())) continue;
			let level = def.skillLevel(this.character, true, excludes, this.type.startsWith("skill"));
			if (def.type == "skill") {
				let other = this.character.bestSkillNamed(def.name, def.specialization, true, excludes);
				if (other) {
					level -= this.character.skillComparedBonusFor("skill.name", def.name, def.specialization, this.tags, null);
					level -= this.character.bonusFor(`skill.name/${def.name.toLowerCase()}`, null);
				}
			}
			if (best < level) {
				best = level;
				bestDef = def.noLevelOrPoints;
				bestDef.level = level;
			}
		}
		return bestDef;
	}

	equivalent(def: SkillDefault, other: SkillDefault | null): boolean {
		return other != null &&
			def.type == other.type &&
			def.modifier == other.modifier &&
			def.name == other.name &&
			def.specialization == other.specialization;
	}

	inDefaultChain(character: CharacterGURPS, def: SkillDefault, lookedAt: Map<string, boolean>): boolean {
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

	updateLevel(): boolean {
		const saved = this.level;
		this.defaulted_from = this.bestDefaultWithPoints(null);
		this.level = this.calculateLevel;
		return saved != this.level;
	}
}

export interface SkillGURPS {
	readonly data: SkillData;
}
