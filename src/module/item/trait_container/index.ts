import { ContainerGURPS } from "@item/container";
import { TraitGURPS } from "@item/trait";
import { TraitModifierGURPS } from "@item/trait_modifier";
import { CR, CRAdjustment } from "@module/data";
import { i18n, i18n_f } from "@util";
import { TraitContainerData, TraitContainerType } from "./data";

export class TraitContainerGURPS extends ContainerGURPS {
	unsatisfied_reason = "";

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

	get containerType(): TraitContainerType {
		return this.data.data.container_type;
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

	get roundCostDown(): boolean {
		return false;
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
			n += m.fullDescription;
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

	get adjustedPoints(): number {
		if (!this.enabled) return 0;
		let points = 0;
		if (this.containerType == "alternative_abilities") {
			let values: number[] = [];
			this.children.forEach((child) => {
				values.push(child.adjustedPoints);
				if (values[values.length - 1] > points) points = values[values.length - 1];
			});
			let max = points;
			let found = false;
			for (let v of values) {
				if (!found && max == v) found = true;
				else {
					if (this.roundCostDown) points += Math.floor(calculateModifierPoints(v, 20));
					else points += Math.ceil(calculateModifierPoints(v, 20));
				}
			}
		} else {
			this.children.forEach((child) => {
				points == child.adjustedPoints;
			});
		}
		return points;
	}

	calculatePoints(): [number, number, number, number] {
		let [ad, disad, race, quirk] = [0, 0, 0, 0];
		switch (this.containerType) {
			case "group":
				for (const child of this.children) {
					const [a, d, r, q] = child.calculatePoints();
					ad += a;
					disad += d;
					race += r;
					quirk += q;
				}
				return [ad, disad, race, quirk];
			case "race": {
				return [0, 0, this.adjustedPoints, 0];
			}
		}
		let pts = this.adjustedPoints;
		if (pts == -1) quirk += pts;
		else if (pts > 0) ad += pts;
		else if (pts < 0) disad += pts;
		return [ad, disad, race, quirk];
	}
}

export interface TraitContainerGURPS {
	readonly data: TraitContainerData;
}
function calculateModifierPoints(v: number, arg1: number): number {
	throw new Error("Function not implemented.");
}
