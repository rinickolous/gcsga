import { BaseFeature, FeatureType } from "./base";

export class ReactionBonus extends BaseFeature {
	type: FeatureType = "reaction_bonus";
	sources: string[] = [];

	get featureMapKey(): string {
		return "reaction";
	}
}

export interface ReactionBonus extends BaseFeature {
	situation: string;
	sources: string[];
}
