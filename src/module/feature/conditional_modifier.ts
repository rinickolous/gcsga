import { BaseFeature, FeatureType } from "./base";

export class ConditionalModifier extends BaseFeature {
	type: FeatureType = "conditional_modifier";
}

export interface ConditionalModifier extends BaseFeature {
	situation: string;
}
