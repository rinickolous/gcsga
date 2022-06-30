import { FeatureType } from "@feature";
import { BaseFeature } from "./base";

export class DRBonus extends BaseFeature {
	type: FeatureType = "dr_bonus";
}

export interface DRBonus extends BaseFeature {
	location: string;
	specialization?: string;
}
