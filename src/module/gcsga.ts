/**
 * MIT License
 *
 * Copyright (c) 2022 Mikolaj Tomczynski
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 * GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games.
 * All rights are reserved by Steve Jackson Games.
 * This game aid is the original creation of Mikolaj Tomczynski and is released for free distribution,
 * and not for resale, under the permissions granted by
 * http://www.sjgames.com/general/online_policy.html
 */

// Import TypeScript modules
import { registerSettings, SYSTEM_NAME } from "./settings";
import { preloadTemplates } from "./preloadTemplates";
import { ItemGURPS } from "@item";
import { ActorGURPS } from "@actor";
import { ItemSheetGURPS } from "@item/base/sheet";
import { TraitContainerSheet } from "@item/trait_container/sheet";
import { ContainerSheetGURPS } from "@item/container/sheet";
import { CharacterSheetGURPS } from "@actor/character/sheet";
import { registerHandlebarsHelpers } from "@util/HandlebarsHelpers";
import { GURPSCONFIG } from "./config";
import { SJG_links } from "./modules/pdfoundry";
import { TraitSheet } from "@item/trait/sheet";
import { CharacterImporter } from "@actor/character/import";
import { BasePrereq } from "@module/prereq";
import { BaseFeature } from "@module/feature";

export const GURPS: any = {};
//@ts-ignore
window.GURPS = GURPS;
GURPS.DEBUG = true;
GURPS.LEGAL = `GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games.\nAll rights are reserved by Steve Jackson Games.\nThis game aid is the original creation of Mikolaj Tomczynski and is released for free distribution, and not for resale, under the permissions granted by\nhttp://www.sjgames.com/general/online_policy.html`;
GURPS.SJG_links = SJG_links;
GURPS.CharacterImporter = CharacterImporter;
GURPS.CONFIG = GURPSCONFIG;
GURPS.Feature = BaseFeature
GURPS.Prereq = BasePrereq;
GURPS.BANNER = `
   __   ____   ____  ____    ____     _     __  
  / /  / ___| / ___|/ ___|  / ___|   / \\    \\ \\ 
 / /  | |  _ | |    \\___ \\ | |  _   / _ \\    \\ \\
 \\ \\  | |_| || |___  ___) || |_| | / ___ \\   / /
  \\_\\  \\____| \\____||____/  \\____|/_/   \\_\\ /_/ `;

// Initialize system
Hooks.once("init", async () => {
	console.log(`${SYSTEM_NAME} | Initializing gcsga`);
	console.log(GURPS.BANNER);
	console.log(GURPS.LEGAL);

	const src = `systems/${SYSTEM_NAME}/assets/gcsga.webp`;
	$("#logo").attr("src", src);
	$("#logo").attr("height", "32px");

	// Assign custom classes and constants here
	//@ts-ignore
	CONFIG.Item.documentClass = ItemGURPS;
	CONFIG.Actor.documentClass = ActorGURPS;

	(CONFIG as any).GURPS = GURPSCONFIG;
	// CONFIG.GURPS = {
	// 	Item: {
	// 		documentClasses: {
	// 			trait: TraitGURPS,
	// 			trait_container: TraitContainerGURPS,
	// 			modifier: TraitModifierGURPS,
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

	Items.registerSheet("gcsga", TraitSheet, {
		types: ["trait"],
		makeDefault: true,
		label: "gcsga.item.sheet.trait.name",
	});
	Items.registerSheet("gcsga", TraitContainerSheet, {
		types: ["trait_container"],
		makeDefault: true,
		label: "gcsga.item.sheet.trait_container.name",
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
	// Actors.registerSheet("gcsga", ActorSheetGURPS, {
	// 	makeDefault: true,
	// 	label: "gcsga.actor.sheet.base.name",
	// });
});

// Setup system
Hooks.once("setup", async () => {
	// Do anything after initialization but before
	// ready
});

// When ready
Hooks.once("ready", async () => {
	// Do anything once the system is ready
	
	// Create dummy drag image
	// TODO find a way to not have to do this
	const drag_image = document.createElement("div");
	drag_image.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
		name: "",
		type: "",
	});
	drag_image.id = "drag-ghost";
	document.body.appendChild(drag_image);
});

// Add any additional hooks if necessary
