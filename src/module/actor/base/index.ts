import { ActorDataGURPS, ActorSourceGURPS } from "@actor/data";
import { ContainerGURPS, ItemGURPS } from "@item";
import {
	Context,
	DocumentModificationOptions,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";
import { Feature } from "@module/feature";

export interface ActorConstructorContextGURPS extends Context<TokenDocument> {
	gcsga?: {
		ready?: boolean;
	};
}

//@ts-ignore
class ActorGURPS extends Actor {
	constructor(data: ActorSourceGURPS, context: ActorConstructorContextGURPS = {}) {
		if (context.gcsga?.ready) {
			super(data, context);
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

	protected async _preCreate(
		data: ActorDataConstructorData & ActorDataGURPS,
		options: DocumentModificationOptions,
		user: BaseUser,
	): Promise<void> {
		if (this.data._source.img === foundry.data.ActorData.DEFAULT_ICON) {
			this.data._source.img = data.img = `systems/${SYSTEM_NAME}/assets/icons/${data.type}.svg`;
		}
		await super._preCreate(data, options, user);
	}

	get deepItems(): Collection<ItemGURPS> {
		const items = this.items;
		const deepItems: ItemGURPS[] = [];
		for (const i of items) {
			deepItems.push(i as ItemGURPS);
			if (i instanceof ContainerGURPS)
				i.deepItems.forEach((e: ItemGURPS) => {
					return deepItems.push(e);
				});
		}
		const deepMap = new Collection(
			deepItems.map((e) => {
				return [e.id!, e];
			}),
		);
		return deepMap;
	}

	prepareEmbeddedDocuments(): void {
		super.prepareEmbeddedDocuments();
		this.items.forEach((item) => {
			//@ts-ignore
			item.data.flags.gcsga.parents = [this.id];
		});
		let iterator = 0;
		this.items.forEach((item) => {
			if (item.data.sort == 0) {
				iterator += 1;
				item.data.sort = iterator * 1000;
			}
		});
	}
}

//@ts-ignore
interface ActorGURPS {
	readonly data: ActorDataGURPS;
}

export { ActorGURPS };
