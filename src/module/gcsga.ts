/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system.
 */

// Import TypeScript modules
import { registerSettings } from "./settings";
import { preloadTemplates } from "./preloadTemplates";
import { ItemGURPS } from "@item";
import { ActorGURPS } from "@actor";
import { ItemSheetGURPS } from "@item/base/sheet";
import { AdvantageContainerSheet } from "@item/advantage_container/sheet";
import { ContainerSheetGURPS } from "@item/container/sheet";
import { ActorSheetGURPS } from "@actor/base/sheet";
import { CharacterSheetGURPS } from "@actor/character/sheet";
import { registerHandlebarsHelpers } from "@util/HandlebarsHelpers";
import { GURPSCONFIG } from "./config";
import { SJG_links } from "./modules/pdfoundry";

export const GURPS: any = {};
//@ts-ignore
window.GURPS = GURPS;
GURPS.DEBUG = true;
GURPS.LEGAL = `GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games. All rights are reserved by Steve Jackson Games. This game aid is the original creation of Chris Normand/Nose66 and is released for free distribution, and not for resale, under the permissions granted by http://www.sjgames.com/general/online_policy.html`
GURPS.SJG_links = SJG_links;

// Initialize system
Hooks.once("init", async () => {
	console.log("gcsga | Initializing gcsga");

	const src = "systems/gcsga/assets/gcsga.webp";
	$("#logo").attr("src", src);
	$("#logo").attr("height", "32px");

	// Assign custom classes and constants here
	//@ts-ignore
	CONFIG.Item.documentClass = ItemGURPS;
	//@ts-ignore
	CONFIG.Actor.documentClass = ActorGURPS;

	// @ts-ignore
	CONFIG.GURPS = GURPSCONFIG;
	// CONFIG.GURPS = {
	// 	Item: {
	// 		documentClasses: {
	// 			advantage: AdvantageGURPS,
	// 			advantage_container: AdvantageContainerGURPS,
	// 			modifier: AdvantageModifierGURPS,
	// 			skill: SkillGURPS,
	// 			technique: TechniqueGURPS,
	// 			skill_container: SkillContainerGURPS,
	// 			spell: SpellGURPS,
	// 			ritual_magic_spell: RitualMagicSpellGURPS,
	// 			spell_container: SpellContainerGURPS,
	// 			equipment: EquipmentGURPS,
	// 			equipment_container: EquipmentContainerGURPS,
	// 			eqp_modifier: EquipmentModifierGURPS,
	// 			note: NoteGURPS,
	// 			note_container: NoteContainerGURPS
	// 		}
	// 	},
	// 	Actor: {
	// 		documentClasses: {
	// 			character: CharacterGURPS
	// 		}
	// 	}
	// }
	// Register custom system settings
	registerSettings();

	// Preload Handlebars templates
	await preloadTemplates();
	registerHandlebarsHelpers();

	// Register custom sheets (if any)
	Items.unregisterSheet("core", ItemSheet);
	Actors.unregisterSheet("core", ActorSheet);

	Items.registerSheet("gcsga", AdvantageContainerSheet, {
		types: ["advantage_container"],
		makeDefault: true,
		label: "gcsga.item.sheet.advantage_container.name",
	});
	Items.registerSheet("gcsga", ContainerSheetGURPS, {
		types: ["skill_container", "spell_container", "equipment_container", "note_container"],
		makeDefault: true,
		label: "gcsga.item.sheet.container.name",
	});
	Items.registerSheet("gcsga", ItemSheetGURPS, {
		makeDefault: false,
		label: "gcsga.item.sheet.base.name",
	});

	Actors.registerSheet("gcsga", CharacterSheetGURPS, {
		types: ["character"],
		makeDefault: true,
		label: "gcsga.actor.sheet.character.name",
	});
	Actors.registerSheet("gcsga", ActorSheetGURPS, {
		makeDefault: true,
		label: "gcsga.actor.sheet.base.name",
	});
});

// Setup system
Hooks.once("setup", async () => {
	// Do anything after initialization but before
	// ready
});

// When ready
Hooks.once("ready", async () => {
	// Do anything once the system is ready
});

// Add any additional hooks if necessary
