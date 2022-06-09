import { ActorDataGURPS, ActorSourceGURPS } from "@actor/data";
import { ContainerGURPS, ItemGURPS } from "@item";
import {
	Context,
	DocumentModificationOptions,
} from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/document.mjs";
import { ActorDataConstructorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/actorData";
import { BaseUser } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs";
import { SYSTEM_NAME } from "@module/settings";

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

	get deepItems(): Collection<Item> {
		const items = this.items;
		const deepItems = [];
		for (const i of items) {
			deepItems.push(i);
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

	// UNUSED FUNCTION
	// getDeepItem(ids: string | Array<string>) {
	// 	if (!Array.isArray(ids)) ids = ids.split(" ");
	// 	ids = ids.filter((e) => e);
	// 	// console.log(ids);
	// 	if (ids.length == 1) return this;
	// 	// eslint-disable-next-line @typescript-eslint/no-this-alias
	// 	let parent: any = this;
	// 	for (let i = 0; i < ids.length; i++) {
	// 		if (i == 0) continue;
	// 		else if (i == ids.length - 1) {
	// 			const the_item = parent.getEmbeddedDocument("Item", ids[i]);
	// 			return the_item;
	// 		} else parent = parent.getEmbeddedDocument("Item", ids[i]);
	// 	}
	// }

	// /** @override */
	// prepareEmbeddedDocuments() {
	// 	super.prepareEmbeddedDocuments();
	// 	for (const item of this.items) {
	// 		item.setFlag("gcsga", "parents", [this.data._id]);
	// 	}
	// }
}

//@ts-ignore
interface ActorGURPS {
	readonly data: ActorDataGURPS;
}

export { ActorGURPS };
