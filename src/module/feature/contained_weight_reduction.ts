import { BaseFeature, FeatureType } from "./base";

export class ContainedWeightReduction extends BaseFeature {
	type: FeatureType = "contained_weight_reduction";

	get is_percentage_reduction(): boolean {
		return this.reduction.endsWith("%");
	}

	get featureMapKey(): string {
		return "equipment.weight.sum";
	}
}

export interface ContainedWeightReduction extends BaseFeature {
	reduction: string;
}
