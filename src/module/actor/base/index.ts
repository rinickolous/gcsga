import { GURPSCONFIG as CONFIG } from "@module/config";
import { ActorDataGURPS, ActorSourceGURPS } from "@actor/data";
import {
	Context,
	DocumentModificationOptions,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";
import Collection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/utils/collection.mjs";
import { ContainerGURPS, ItemGURPS } from "@item";

export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
	gcsga?: {
		ready?: boolean;
		imported?: boolean;
	};
}

class BaseActorGURPS extends Actor {
	constructor(data: ActorSourceGURPS, context: ActorConstructorContextGURPS = {}) {
		if (context.gcsga?.ready) {
			super(data, context);
		} else {
			mergeObject(context, { gcsga: { ready: true } });
			const ActorConstructor = CONFIG.Actor.documentClasses[data.type];
			return ActorConstructor ? new ActorConstructor(data, context) : new BaseActorGURPS(data, context);
		}
	}

	protected async _preCreate(
		data: ActorDataConstructorData & ActorDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser,
	): Promise<void> {
		if (this.data._source.img === foundry.data.ActorData.DEFAULT_ICON)
			this.data._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg`;
		await super._preCreate(data, options, user);
	}

	get deepItems(): Collection<ItemGURPS> {
		const deepItems: ItemGURPS[] = [];
		for (const item of this.items.entries) {
			deepItems.push(item);
			if (item instanceof ContainerGURPS)
				item.deepItems.forEach((item: ItemGURPS) => {
					return deepItems.push(item);
				});
		}
		return new Collection(
			deepItems.map((e) => {
				return [e.id!, e];
			}),
		);
	}
}

interface BaseActorGURPS extends Actor {
	readonly data: ActorDataGURPS;
	deepItems: Collection<ItemGURPS>;
}

export { BaseActorGURPS };
