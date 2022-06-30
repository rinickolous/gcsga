import { ContainerGURPS, TraitGURPS, TraitModifierGURPS } from "@item";
import { CR, CRAdjustment } from "@module/data";
import { i18n, i18n_f } from "@util";
import { TraitContainerData } from "./data";

export class TraitContainerGURPS extends ContainerGURPS {
	static override get schema(): typeof TraitContainerData {
		return TraitContainerData;
	}

	// Getters
	get enabled(): boolean {
		if (this.data.data.disabled) return false;
		let enabled = !this.data.data.disabled;
		if (this.parent instanceof TraitContainerGURPS) enabled = enabled && this.parent.enabled;
		return enabled;
	}

	set enabled(enabled: boolean) {
		this.data.data.disabled = !enabled;
	}

	get levels(): number {
		return 0;
	}

	get cr(): CR {
		return this.data.data.cr;
	}

	get crAdj(): CRAdjustment {
		return this.data.data.cr_adj;
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
	get children(): Collection<TraitGURPS | TraitContainerGURPS> {
		//@ts-ignore
		return new Collection(
			this.items
				.filter((item) => item instanceof TraitGURPS || item instanceof TraitContainerGURPS)
				.map((item) => {
					return [item.data._id!, item];
				}),
		);
	}
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

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
