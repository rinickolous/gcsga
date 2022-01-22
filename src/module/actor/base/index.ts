import { ActorDataGURPS, ActorSourceGURPS } from "@actor/data";
import { Context } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";

export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
	gcsga?: {
		ready?: boolean;
	};
}

//@ts-ignore
class ActorGURPS extends Actor {
	private initialized: boolean | undefined;

	constructor(data: ActorSourceGURPS, context: ActorConstructorContextGURPS = {}) {
		if (context.gcsga?.ready) {
			super(data, context);
			this.initialized = true;
		} else {
			mergeObject(context, { gcsga: { ready: true } });
			//@ts-ignore
			const ActorConstructor = CONFIG.GURPS.Actor.documentClasses[data.type];
			return ActorConstructor ? new ActorConstructor(data, context) : new ActorGURPS(data, context);
		}
	}

	getData() {
		return this.data.data;
	}
}

//@ts-ignore
interface ActorGURPS {
	readonly data: ActorDataGURPS;
}

export { ActorGURPS };
