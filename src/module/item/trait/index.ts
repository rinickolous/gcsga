import { ContainerGURPS, TraitContainerGURPS, TraitModifierGURPS } from "@item";
import { CR, CRAdjustment } from "@module/data";
import { i18n, i18n_f } from "@util";
import { TraitData } from "./data";

export class TraitGURPS extends ContainerGURPS {
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

	get levels(): number {
		return this.data.data.levels;
	}

	get cr(): CR {
		return this.data.data.cr;
	}

	get crAdj(): CRAdjustment {
		return this.data.data.cr_adj;
	}

	get features() {
		return this.data.data.features;
	}

	get prereqs() {
		return this.data.data.prereqs;
	}

	get prereqsEmpty(): boolean {
		return this.prereqs.prereqs.length == 0;
	}

	get modifierNotes(): string {
		let n = "";
		if (this.cr != -1) {
			n += i18n(`gcsga.trait.cr_level.${this.cr}`);
			if (this.crAdj != "none") {
				n += ", " + i18n_f(`gcsga.trait.cr_adj.${this.crAdj}`, { penalty: "TODO" });
			}
		}
		this.modifiers.forEach((m) => {
			if (n.length) n += ";";
			n += m.full_description;
		});
		return n;
	}

	// Embedded Items
	get modifiers(): Collection<TraitModifierGURPS> {
		//@ts-ignore
		return new Collection(
			this.items
				.filter((item) => item instanceof TraitModifierGURPS)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}
}

export interface TraitGURPS {
	readonly data: TraitData;
}
