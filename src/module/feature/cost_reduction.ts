import { FeatureType } from "@feature";
import { BaseFeature } from "./base";

export class CostReduction extends BaseFeature {
	type: FeatureType = "cost_reduction";
}

export interface CostReduction extends BaseFeature {
	attribute: string;
	percentage: number;
}
