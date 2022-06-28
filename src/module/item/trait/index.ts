import { ItemGURPS, TraitContainerGURPS, TraitModifierGURPS } from "@item";
import { CRAdjustment } from "@module/data";
import { PrereqList } from "@module/prereq";
import { CR_Multiplier, i18n, i18n_f } from "@util";
import { ContainerGURPS } from "../container";
import { TraitData } from "./data";

//@ts-ignore
export class TraitGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

	static override get schema(): typeof TraitData {
		return TraitData;
	}

	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent?.type == "trait_container") enabled = enabled && (this.parent as ItemGURPS).enabled;
		return enabled;
	}

	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}

	get levels(): number {
		return parseFloat(this.data.data.levels);
	}

	get cr(): number {
		return this.data.data.cr;
	}

	get cr_adj(): CRAdjustment {
		return this.data.data.cr_adj;
	}

	get prereqs(): PrereqList {
		return this.data.data.prereqs;
	}

	get base_points(): number {
		return this.data.data.base_points;
	}

	get points_per_level(): number {
		return this.data.data.points_per_level;
	}

	get round_cost_down(): boolean {
		return this.data.data.round_down;
	}

	get all_modifiers(): TraitModifierGURPS[] {
		let all = Array.from(this.modifiers);
		let p = this.parent;
		while (p instanceof TraitContainerGURPS) {
			all.concat(Array.from(p.modifiers));
			p = p.parent;
		}
		return all;
	}

	get modifiers(): Collection<TraitModifierGURPS> {
		let m = this.items.filter((e) => e instanceof TraitModifierGURPS) as TraitModifierGURPS[];
		return new Collection<TraitModifierGURPS>(
			m.map((e) => {
				return [e.id!, e];
			}),
		);
	}

	get modifier_notes(): string {
		let n = "";
		if (this.cr != -1) {
			n += i18n(`gcsga.trait.cr_level.${this.cr}`);
			if (this.cr_adj != "none") {
				n += ", " + i18n_f(`gcsga.trait.cr_adj.${this.cr_adj}`, { penalty: "TODO" });
			}
		}
		this.modifiers.forEach((m) => {
			if (n.length) n += ";";
			n += m.full_description;
		});
		return n;
	}

	get adjusted_points(): number {
		// return adjustedPoints(this.character, this.base_points, this.levels, this.points_per_level, this.cr, this.all_modifiers, this.round_cost_down);
		let [baseEnh, levelEnh, baseLim, levelLim] = [0, 0, 0, 0,];
		let multiplier = CR_Multiplier(this.cr);
		this.modifiers.forEach(mod => {
			let modifier = mod.cost_type;
		});
	}
}

export interface TraitGURPS {
	readonly data: TraitData;
}
