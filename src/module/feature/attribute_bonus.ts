import { BaseFeature, FeatureConstructionContext, FeatureType } from "./base";

export class AttributeBonus extends BaseFeature {
	type: FeatureType = "attribute_bonus";

	constructor(data: AttributeBonus | any, context: FeatureConstructionContext) {
		super(data, context);
	}

	get featureMapKey(): string {
		let key = "attr." + this.attribute;
		if (this.limitation && this.limitation != "none") {
			key += "." + this.limitation;
		}
		return key;
	}
}

export interface AttributeBonus extends BaseFeature {
	attribute: string;
	limitation: AttributeBonusLimitation;
}

type AttributeBonusLimitation = "none" | "striking_only" | "lifting_only" | "throwing_only";
