//@ts-nocheck

import { ActorConstructorContextGURPS, BaseActorGURPS } from "@actor/base";
import { ActorSheetGURPS } from "@actor/base/sheet";
import { BaseItemGURPS } from "@item";
import EmbeddedCollection from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/abstract/embedded-collection.mjs";
import { ActorData } from "@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs";
import { g } from "@module/constants";
import { RollModifier } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";
import { i18n } from "@util";
import {
	MoveMode,
	MoveModeTypes,
	StaticCharacterSource,
	StaticCharacterSystemData,
} from "./data";

Hooks.on("createActor", async function (actor: StaticCharacterGURPS) {
	if (actor.type == "character")
		await actor.update({
			"system.migrationVersion": g.system.data.version,
		});
});

class StaticCharacterGURPS extends BaseActorGURPS {
	// TODO: Incorporate static character

	constructor(
		data: StaticCharacterSource,
		context: ActorConstructorContextGURPS = {},
	) {
		super(data, context);
	}

	getOwners() {
		return g.users?.contents.filter(
			u =>
				this.getUserLevel(u) ??
				0 >= CONST.DOCUMENT_PERMISSION_LEVELS.OWNER,
		);
	}

	async openSheet(newSheet: ActorSheetGURPS): Promise<void> {
		const sheet = this.sheet;
		if (!!sheet) {
			await sheet.close();
			this._sheet = null;
			delete this.apps[sheet.appId];
			await this.setFlag("core", "sheetClass", newSheet);
			this.sheet?.render(true);
		}
	}

	override prepareBaseData(): void {
		// NOTE: why not set flags after sizemod calculation?
		super.prepareBaseData();
		this.system.conditions.posture = "standing";
		this.setFlag(SYSTEM_NAME, "selfModifiers", []);
		this.setFlag(SYSTEM_NAME, "targetModifiers", []);
		// this.system.conditions.self = { modifiers: [] };
		// this.system.conditions.target = { modifiers: [] };
		this.system.conditions.exhausted = false;
		this.system.conditions.reeling = false;

		let sizemod = this.system.traits.sizemod;
		if (sizemod !== 0) {
			this.system.conditions.target.modifiers.push();
			this.setFlag(SYSTEM_NAME, "targetModifiers", [
				...(this.getFlag(
					SYSTEM_NAME,
					"targetModifiers",
				) as RollModifier[]),
				{
					name: "for Size Modifier",
					modifier: sizemod,
					tags: [],
				},
			]);
		}

		// let attributes = this.getGurpsActorData().attributes;
		// if (foundry.utils.getType(attributes.ST.import) === "string")
		// 	this.getGurpsActorData().attributes.ST.import = parseInt(
		// 		attributes.ST.import,
		// 	);
	}

	prepareDerivedData(): void {
		super.prepareDerivedData();

		// Handle new move data -- if system.move exists, use the default value in that object to set the move
		// value in the first entry of the encumbrance object
		// TODO: migrate to GCS move calculation
		if (this.system.encumbrance) {
			let move: MoveMode = this.system.move;
			if (!move) {
				let currentMove =
					this.system.encumbrance["00000"].move ??
					this.system.basicmove.value;
				let value: MoveMode = {
					mode: MoveModeTypes.Ground,
					basic: currentMove,
					default: true,
				};
				setProperty(this, "system.move.00000", value);
				move = this.system.move;
			}

			let current = Object.values(move).find(it => it.default);
			if (current) {
				this.system.encumbrance["00000"].move = current.basic;
			}
		}

		this.calculateDerivedValues();
	}

	// Execute after every import
	async postImport() {
		this.calculateDerivedValues();

		// TODO: figure out how to change the type of this.items to the appropriate type
		let orig: StaticItemGURPS[] = (
			this.items as EmbeddedCollection<typeof BaseItemGURPS, ActorData>
		).contents
			.slice()
			.sort((a, b) => b.name?.localeCompare(a.name ?? "") ?? 0);
		let good: StaticItemGURPS[] = [];
		while (orig.length > 0) {
			// We are trying to place 'parent' items before we place 'children' items
			let left: StaticItemGURPS[] = [];
			let atLeastOne = false;
			for (const i of orig) {
				if (
					!i.system.eqt.parentuuid ||
					good.find(e => e.system.eqt.uuid == i.system.eqt.parentuuid)
				) {
					atLeastOne = true;
					good.push(i);
				} else left.push(i);
			}
			if (atLeastOne) orig = left;
			else {
				// If unable to move at least one, just copy the rest and hpe for the best
				good = [...good, ...left];
				orig = [];
			}
		}
		for (const item of good) await this.addItemData(item.data);

		await this.update(
			{ "data.migrationVersion": g.system.data.version },
			{ diff: false, render: false },
		);

		// Set custom trackers based on templates. Should be last because it may need other data to initialize.
		await this.setResourceTrackers();
		await this.syncLanguages();
	}

	// Ensure Language Advantages conform to a standard (for Polygot module)
	async syncLanguages(): Promise<void> {
		if (this.system.languages) {
			// let updated = false;
			let newads = this.system.ads;
			let langn = new RegExp("Language:?", "i");
			let langt = new RegExp(i18n("GURPS.language") + ":?", "i");
			recurseList(this.system.languages, (e, k, d) => {
				let a = GURPS.findAdDisad(this, "*" + e.name); // Is there an advantage including the same name
				if (a) {
					if (!a.name.match(langn) && !a.name.match(langt)) {
						// GCA4 / GCS style
						a.name = i18n("GURPS.language") + ": " + a.name;
						// updated = true;
					}
				} else {
					// GCA5 style (Language without Adv)
					let n = i18n("GURPS.language") + ": " + e.name;
					if (e.spoken == e.written) n += ` (${e.spoken})`;
					// TODO: may be broken, check later
					// Otherwise, report type and level (like GCA4)
					else if (!!e.spoken)
						n += ` (${i18n("GURPS.spoken")}) (${e.spoken})`;
					else n += ` (${i18n("GURPS.written")}) (${e.written})`;
					let a = new Advantage();
					a.name = n;
					a.points = e.points;
					// why is put global?
					GURPS.put(newads, a);
					// updated = true;
				}
			});
		}
	}
}

interface StaticCharacterGURPS extends BaseActorGURPS {
	system: StaticCharacterSystemData;
	_source: StaticCharacterSource;
}

export { StaticCharacterGURPS };
