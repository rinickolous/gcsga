import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { data } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/module.mjs";

export class ActiveEffectGURPS extends ActiveEffect {
	constructor(data: data.ActiveEffectData, context: Context<Actor | Item>) {
		data.disabled = true;
		data.transfer = false;
		super(data, context);
	}
}
