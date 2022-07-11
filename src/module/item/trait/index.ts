import { ContainerGURPS } from "@item/container";
import { TraitContainerGURPS } from "@item/trait_container";
import { TraitModifierGURPS } from "@item/trait_modifier";
import { CR, CRAdjustment } from "@module/data";
import { PrereqList } from "@prereq";
import { i18n, i18n_f, SelfControl } from "@util";
import { TraitData } from "./data";
import { Feature } from "@module/feature";
import { BaseFeature } from "@feature/base";
import { BaseWeapon, Weapon } from "@module/weapon";

export class TraitGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof TraitData {
		return TraitData;
	}

	// Getters
	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent && this.parent instanceof TraitContainerGURPS) enabled = enabled && this.parent.enabled;
		return enabled;
	}
	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}

	get isLeveled(): boolean {
		return this.pointsPerLevel != 0;
	}

	get levels(): number {
		return this.data.data.levels;
	}

	get basePoints(): number {
		return this.data.data.base_points;
	}

	get pointsPerLevel(): number {
		return this.data.data.points_per_level;
	}

	get cr(): number {
		return this.data.data.cr;
	}

	get crAdj(): CRAdjustment {
		return this.data.data.cr_adj;
	}

	get formattedCR(): string {
		let cr = "";
		if (this.cr != CR.None) cr += i18n(`gcsga.trait.cr_level.${this.cr}`);
		if (this.crAdj != "none")
			cr +=
				", " +
				i18n_f(`gcsga.trait.cr_adj.${this.crAdj}`, { penalty: SelfControl.adjustment(this.cr, this.crAdj) });
		return cr;
	}

	get features() {
		const features: Feature[] = [];
		for (const f of this.data.data.features ?? []) {
			features.push(new BaseFeature(f));
		}
		return features;
	}

	get weapons(): Weapon[] {
		const weapons: Weapon[] = [];
		for (const w of this.data.data.weapons ?? []) {
			weapons.push(new BaseWeapon({ ...w, ...{ parent: this, actor: this.actor } }));
		}
		return weapons;
	}

	get prereqs() {
		return new PrereqList(this.data.data.prereqs);
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	get roundCostDown(): boolean {
		return this.data.data.round_down;
	}

	get modifierNotes(): string {
		let n = "";
		if (this.cr != -1) {
			n += i18n(`gcsga.trait.cr_level.${this.cr}`);
			if (this.crAdj != "none") {
				n += ", " + i18n_f(`gcsga.trait.cr_adj.${this.crAdj}`, { penalty: "TODO" });
			}
		}
		this.modifiers.forEach(m => {
			if (n.length) n += ";";
			n += m.fullDescription;
		});
		return n;
	}

	get adjustedPoints(): number {
		if (!this.enabled) return 0;
		let baseEnh = 0;
		let levelEnh = 0;
		let baseLim = 0;
		let levelLim = 0;
		let basePoints = this.basePoints;
		let pointsPerLevel = this.pointsPerLevel;
		let multiplier = this.crMultiplier(this.cr);
		this.modifiers.forEach(mod => {
			const modifier = mod.costModifier;
			switch (mod.costType) {
				case "percentage":
					switch (mod.affects) {
						case "total":
							baseLim += modifier;
							levelLim += modifier;
							return;
						case "base_only":
							baseLim += modifier;
							return;
						case "levels_only":
							levelLim += modifier;
							return;
					}
				case "points":
					if (mod.affects == "levels_only") pointsPerLevel += modifier;
					else basePoints += modifier;
					return;
				case "multiplier":
					multiplier *= modifier;
			}
		});
		let modifiedBasePoints = basePoints;
		let leveledPoints = pointsPerLevel * this.levels;
		if (baseEnh != 0 || baseLim != 0 || levelEnh != 0 || levelLim != 0) {
			if (this.actor?.settings.use_multiplicative_modifiers) {
				if (baseEnh == levelEnh && baseLim == levelLim)
					modifiedBasePoints = modifyPoints(
						modifyPoints(modifiedBasePoints + leveledPoints, baseEnh),
						Math.max(-80, baseLim),
					);
				else
					modifiedBasePoints =
						modifyPoints(modifyPoints(modifiedBasePoints, baseEnh), Math.max(-80, baseLim)) +
						modifyPoints(modifyPoints(leveledPoints, levelEnh), Math.max(-80, levelLim));
			} else {
				let baseMod = Math.max(-80, baseEnh + baseLim);
				let levelMod = Math.max(-80, levelEnh + levelLim);
				if (baseMod == levelMod) modifiedBasePoints = modifyPoints(modifiedBasePoints + leveledPoints, baseMod);
				else
					modifiedBasePoints =
						modifyPoints(modifiedBasePoints, baseMod) + modifyPoints(leveledPoints, levelMod);
			}
		} else {
			modifiedBasePoints += leveledPoints;
		}
		if (this.roundCostDown) return Math.floor(modifiedBasePoints * multiplier);
		else return Math.ceil(modifiedBasePoints * multiplier);
	}

	// Embedded Items
	get modifiers(): Collection<TraitModifierGURPS> {
		return new Collection(
			this.items
				.filter(item => item instanceof TraitModifierGURPS)
				.map(item => {
					return [item.data._id!, item];
				}),
		) as Collection<TraitModifierGURPS>;
	}

	calculatePoints(): [number, number, number, number] {
		let [ad, disad, race, quirk] = [0, 0, 0, 0];
		let pts = this.adjustedPoints;
		if (pts == -1) quirk += pts;
		else if (pts > 0) ad += pts;
		else if (pts < 0) disad += pts;
		return [ad, disad, race, quirk];
	}

	crMultiplier(cr: number): number {
		switch (cr) {
			case -1:
				return 1;
			case 6:
				return 2;
			case 9:
				return 1.5;
			case 12:
				return 1;
			case 15:
				return 0.5;
			default:
				return this.crMultiplier(-1);
		}
	}
}

export function modifyPoints(points: number, modifier: number): number {
	return points + calculateModifierPoints(points, modifier);
}

export function calculateModifierPoints(points: number, modifier: number): number {
	return (points * modifier) / 100;
}

export interface TraitGURPS {
	readonly data: TraitData;
}
