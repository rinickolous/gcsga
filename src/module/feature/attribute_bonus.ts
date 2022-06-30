import { FeatureType } from "@feature";
import { BaseFeature, FeatureConstructionContext } from "./base";

export class AttributeBonus extends BaseFeature {
	type: FeatureType = "attribute_bonus";

	constructor(data: AttributeBonus | any, context: FeatureConstructionContext) {
		super(data, context);
	}
}

export interface AttributeBonus extends BaseFeature {
	attribute: string;
}
