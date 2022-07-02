import { BaseFeature, FeatureType } from "./base";

export class ReactionBonus extends BaseFeature {
	type: FeatureType = "reaction_bonus";
}

export interface ReactionBonus extends BaseFeature {
	situation: string;
}
