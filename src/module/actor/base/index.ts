import { ActorDataGURPS, ActorSourceGURPS } from "@actor/data";
import {
	Context,
	DocumentModificationOptions,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";
import { ContainerGURPS, ItemGURPS } from "@item";
import { ActorSystemData, BaseActorSourceGURPS } from "./data";

export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
	gurps?: {
		ready?: boolean;
		imported?: boolean;
	};
}

class BaseActorGURPS extends Actor {
	constructor(
		data: ActorSourceGURPS,
		context: ActorConstructorContextGURPS = {},
	) {
		if (context.gurps?.ready) {
			super(data, context);
		} else {
			mergeObject(context, { gurps: { ready: true } });
			const ActorConstructor = (CONFIG as any).GURPS.Actor
				.documentClasses[data.type];
			return ActorConstructor
				? new ActorConstructor(data, context)
				: new BaseActorGURPS(data, context);
		}
	}

	protected async _preCreate(
		data: ActorDataConstructorData & ActorDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser,
	): Promise<void> {
		//@ts-ignore TODO:
		if (this._source.img === foundry.documents.BaseActor.DEFAULT_ICON)
			this._source.img =
				data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg`;
		await super._preCreate(data, options, user);
	}

	get deepItems(): Collection<ItemGURPS> {
		const deepItems: ItemGURPS[] = [];
		for (const item of this.items as any as Collection<ItemGURPS>) {
			deepItems.push(item);
			if (item instanceof ContainerGURPS)
				item.deepItems.forEach((item: ItemGURPS) => {
					deepItems.push(item);
				});
		}
		return new Collection(
			deepItems.map(e => {
				return [e.id!, e];
			}),
		);
	}
}

interface BaseActorGURPS extends Actor {
	// readonly data: BaseActorDataGURPS;
	deepItems: Collection<ItemGURPS>;
	// temp
	system: ActorSystemData;
	_source: BaseActorSourceGURPS;
	_id: string;
}

export { BaseActorGURPS };
