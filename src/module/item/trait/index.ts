import { ContainerGURPS } from "@item/container";
import { TraitContainerGURPS } from "@item/trait_container";
import { TraitModifierGURPS } from "@item/trait_modifier";
import { CR, CRAdjustment } from "@module/data";
import { PrereqList } from "@prereq";
import { i18n, i18n_f, SelfControl } from "@util";
import { TraitData } from "./data";

export class TraitGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	// static override get schema(): TraitData {
	// 	return TraitData;
	// }

	// Getters
	get enabled(): boolean {
		if (this.system.disabled) return false;
		let enabled = !this.system.disabled;
		if (this.parent && this.parent instanceof TraitContainerGURPS) enabled = enabled && this.parent.enabled;
		return enabled;
	}
	set enabled(enabled: boolean) {
		this.system.disabled = !enabled;
	}

	get isLeveled(): boolean {
		return this.pointsPerLevel != 0;
	}

	get levels(): number {
		return this.system.levels ?? 0;
	}

	get basePoints(): number {
		return this.system.base_points ?? 0;
	}

	get pointsPerLevel(): number {
		return this.system.points_per_level ?? 0;
	}

	get cr(): CR {
		return this.system.cr;
	}

	get crAdj(): CRAdjustment {
		return this.system.cr_adj;
	}

	get formattedCR(): string {
		let cr = "";
		if (this.cr != CR.None) cr += i18n(`gcsga.trait.cr_level.${this.cr}`);
		if (this.crAdj != "none") cr += ", " + i18n_f(`gcsga.trait.cr_adj.${this.crAdj}`, { penalty: SelfControl.adjustment(this.cr, this.crAdj) });
		return cr;
	}

	get roundCostDown(): boolean {
		return this.system.round_down;
	}

	get modifierNotes(): string {
		let n = "";
		if (this.cr != CR.None) {
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
				if (baseEnh == levelEnh && baseLim == levelLim) {
					modifiedBasePoints = modifyPoints(modifyPoints(modifiedBasePoints + leveledPoints, baseEnh), Math.max(-80, baseLim));
				} else {
					modifiedBasePoints = modifyPoints(modifyPoints(modifiedBasePoints, baseEnh), Math.max(-80, baseLim)) + modifyPoints(modifyPoints(leveledPoints, levelEnh), Math.max(-80, levelLim));
				}
			} else {
				let baseMod = Math.max(-80, baseEnh + baseLim);
				let levelMod = Math.max(-80, levelEnh + levelLim);
				if (baseMod == levelMod) {
					modifiedBasePoints = modifyPoints(modifiedBasePoints + leveledPoints, baseMod);
				} else {
					modifiedBasePoints = modifyPoints(modifiedBasePoints, baseMod) + modifyPoints(leveledPoints, levelMod);
				}
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
					return [item.id!, item];
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

	crMultiplier(cr: CR): number {
		switch (cr) {
			case CR.None:
				return 1;
			case CR.CR6:
				return 2;
			case CR.CR9:
				return 1.5;
			case CR.CR12:
				return 1;
			case CR.CR15:
				return 0.5;
			default:
				return this.crMultiplier(CR.None);
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
	readonly system: TraitData;
}
