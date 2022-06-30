import { CharacterGURPS } from "@actor";
import { Feature } from "@feature";
import { BaseItemGURPS } from "@item/base";
import { SkillDefault } from "@module/skill-default";
import { TooltipGURPS } from "@module/tooltip";
import { PrereqList } from "@prereq";
import { baseRelativeLevel, SkillData, SkillLevel } from "./data";

export class SkillGURPS extends BaseItemGURPS {
	level: SkillLevel = { level: 0, relative_level: 0, tooltip: "" };

	static get schema(): typeof SkillData {
		return SkillData;
	}

	// Getters
	get points(): number {
		return this.data.data.points;
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
		return this.data.data.specialization;
	}

	get defaultedFrom(): SkillDefault | null {
		return this.data.data.defaulted_from;
	}
	set defaultedFrom(v: SkillDefault | null) {
		this.data.data.defaulted_from = v;
	}

	get features(): Feature[] {
		return this.data.data.features;
	}

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	// Point & Level Manipulation
	get calculateLevel(): SkillLevel {
		const points = this.adjustedPoints(null);
		if (!this.actor) return { level: Math.max(), relative_level: Math.max(), tooltip: "" };
		return this.actor.calculateSkillLevel(this, points);
	}

	adjustedPoints(tooltip: TooltipGURPS | null): number {
		let points = this.points;
		if (this.actor) {
			points += this.actor.skillPointComparedBonusFor(
				"skill.points",
				this.name!,
				this.specialization,
				this.tags,
				tooltip,
			);
			points += this.actor.bonusFor(`skills.points/${this.name}`, tooltip);
			points = Math.max(points, 0);
		}
		return points;
	}

	updateLevel(): boolean {
		const saved = this.level;
		this.defaultedFrom = this.bestDefaultWithPoints(null);
		this.level = this.calculateLevel;
		return saved != this.level;
	}

	bestDefaultWithPoints(excluded: SkillDefault | null): SkillDefault | null {
		if (!this.actor) return null;
		const best = this.bestDefault(excluded);
		if (best) {
			const baseline = this.actor.resolveAttributeCurrent(this.attribute) + baseRelativeLevel(this.difficulty);
			const level = best.level;
			best.adjusted_level = level;
			if (level == baseline) best.points = 1;
			else if (level == baseline + 1) best.points = 2;
			else if (level > baseline + 1) best.points = 4 * (level - (baseline + 1));
			else best.points = -Math.max(level, 0);
		}
		return best;
	}

	bestDefault(excluded: SkillDefault | null): SkillDefault | null {
		if (!this.actor || this.data.data.defaults.length == 0) return null;
		const excludes = new Map();
		excludes.set(this.name!, true);
		let bestDef = new SkillDefault();
		let best = Math.max();
		for (const def of this.data.data.defaults) {
			if (this.equivalent(def, excluded) || this.inDefaultChain(this.actor, def, new Map())) continue;
			let level = def.skillLevel(this.actor, true, excludes, this.type.startsWith("skill"));
			if (def.type == "skill") {
				const other = this.actor.bestSkillNamed(def.name ?? "", def.specialization ?? "", true, excludes);
				if (other) {
					level -= this.actor.skillComparedBonusFor(
						"skill.name",
						def.name ?? "",
						def.specialization ?? "",
						this.tags,
						null,
					);
					level -= this.actor.bonusFor(`skill.name/${def.name?.toLowerCase()}`, null);
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
		return (
			other != null &&
			def.type == other.type &&
			def.modifier == other.modifier &&
			def.name == other.name &&
			def.specialization == other.specialization
		);
	}

	inDefaultChain(actor: CharacterGURPS, def: SkillDefault | null, lookedAt: Map<string, boolean>): boolean {
		if (!actor || !def || !def.name) return false;
		let hadOne = false;
		for (const one of (actor.skills as Collection<SkillGURPS>).filter(
			(s) => s.name == def.name && s.specialization == def.specialization,
		)) {
			if (one == this) return true;
			if (typeof one.id == "string" && lookedAt.get(one.id)) {
				lookedAt.set(one.id, true);
				if (this.inDefaultChain(actor, one.defaultedFrom, lookedAt)) return true;
			}
			hadOne = true;
		}
		return !hadOne;
	}
}

export interface SkillGURPS {
	readonly data: SkillData;
}
