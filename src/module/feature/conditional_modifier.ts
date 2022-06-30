import { FeatureType } from "@feature";
import { BaseFeature } from "./base";

export class ConditionalModifier extends BaseFeature {
	type: FeatureType = "conditional_modifier";
}

export interface ConditionalModifier extends BaseFeature {
	situation: string;
}
