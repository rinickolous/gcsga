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
import { preloadTemplates } from "./preload-templates";
import { evaluateToNumber, i18n, registerHandlebarsHelpers } from "@util";
import { CharacterSheetGURPS } from "@actor/sheet";
import { BaseActorGURPS } from "@actor/base";
import { BaseItemGURPS } from "@item";
import { GURPSCONFIG } from "./config";
import { TraitSheet } from "@item/trait/sheet";
import { fSearch } from "@util/fuse";
import { DiceGURPS } from "./dice";
import * as Chat from "@module/chat";
import { TraitContainerSheet } from "@item/trait_container/sheet";
import { SkillSheet } from "@item/skill/sheet";
import { TraitModifierSheet } from "@item/trait_modifier/sheet";
import { TraitModifierContainerSheet } from "@item/trait_modifier_container/sheet";
import { EquipmentModifierContainerSheet } from "@item/equipment_modifier_container/sheet";
import { SpellContainerSheet } from "@item/spell_container/sheet";
import { SkillContainerSheet } from "@item/skill_container/sheet";
import { NoteContainerSheet } from "@item/note_container/sheet";
import { NoteSheet } from "@item/note/sheet";
import { TechniqueSheet } from "@item/technique/sheet";
import { EquipmentSheet } from "@item/equipment/sheet";
import { RitualMagicSpellSheet } from "@item/ritual_magic_spell/sheet";
import { SpellSheet } from "@item/spell/sheet";
import { EquipmentModifierSheet } from "@item/equipment_modifier/sheet";
import { ModifierButton } from "./mod_prompt/button";
import { ItemImporter } from "@item/import";
import { CompendiumBrowser } from "./compendium";
import { g } from "./constants";

Error.stackTraceLimit = Infinity;

export const GURPS: any = {};
(window as any).GURPS = GURPS;
GURPS.DEBUG = true;
GURPS.LEGAL = `GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games.\nAll rights are reserved by Steve Jackson Games.\nThis game aid is the original creation of Mikolaj Tomczynski and is released for free distribution, and not for resale, under the permissions granted by\nhttp://www.sjgames.com/general/online_policy.html`;
GURPS.BANNER = `   __   ____   ____  ____    ____     _     __  
  / /  / ___| / ___|/ ___|  / ___|   / \\    \\ \\ 
 / /  | |  _ | |    \\___ \\ | |  _   / _ \\    \\ \\
 \\ \\  | |_| || |___  ___) || |_| | / ___ \\   / /
  \\_\\  \\____| \\____||____/  \\____|/_/   \\_\\ /_/ `;
GURPS.eval = evaluateToNumber;
GURPS.search = fSearch;
GURPS.dice = DiceGURPS;

// Initialize system
Hooks.once("init", async () => {
	// CONFIG.debug.hooks = true;
	console.log(`${SYSTEM_NAME} | Initializing ${SYSTEM_NAME}`);
	console.log("%c" + GURPS.BANNER, "color:green");
	console.log("%c" + GURPS.LEGAL, "color:yellow");

	// TODO: change back to SYSTEM_NAME after mege
	// const src = `systems/${SYSTEM_NAME}/assets/gurps.webp`;
	const src = `systems/${SYSTEM_NAME}/assets/gurps.webp`;
	$("#logo").attr("src", src);
	$("#logo").attr("height", "32px");

	// Assign custom classes and constants hereby
	(CONFIG as any).GURPS = GURPSCONFIG;
	(CONFIG.Item.documentClass as any) = BaseItemGURPS;
	CONFIG.Actor.documentClass = BaseActorGURPS;

	// Register custom system settings
	registerSettings();

	// Preload Handlebars templates
	await preloadTemplates();
	registerHandlebarsHelpers();

	// Register custom sheets (if any)
	// Items.unregisterSheet("core", ItemSheet);
	Actors.unregisterSheet("core", ActorSheet);

	Items.registerSheet(SYSTEM_NAME, TraitSheet, {
		types: ["trait"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.trait"),
	});
	Items.registerSheet(SYSTEM_NAME, TraitContainerSheet, {
		types: ["trait_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.trait_container"),
	});
	Items.registerSheet(SYSTEM_NAME, TraitModifierSheet, {
		types: ["modifier"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.modifier"),
	});
	Items.registerSheet(SYSTEM_NAME, TraitModifierContainerSheet, {
		types: ["modifier_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.modifier_container"),
	});
	Items.registerSheet(SYSTEM_NAME, SkillSheet, {
		types: ["skill"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.skill"),
	});
	Items.registerSheet(SYSTEM_NAME, TechniqueSheet, {
		types: ["technique"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.technique"),
	});
	Items.registerSheet(SYSTEM_NAME, SkillContainerSheet, {
		types: ["skill_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.skill_container"),
	});
	Items.registerSheet(SYSTEM_NAME, SpellSheet, {
		types: ["spell"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.spell"),
	});
	Items.registerSheet(SYSTEM_NAME, RitualMagicSpellSheet, {
		types: ["ritual_magic_spell"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.ritual_magic_spell"),
	});
	Items.registerSheet(SYSTEM_NAME, SpellContainerSheet, {
		types: ["spell_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.spell_container"),
	});
	Items.registerSheet(SYSTEM_NAME, EquipmentSheet, {
		types: ["equipment", "equipment_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.equipment"),
	});
	Items.registerSheet(SYSTEM_NAME, EquipmentModifierSheet, {
		types: ["eqp_modifier"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.eqp_modifier"),
	});
	Items.registerSheet(SYSTEM_NAME, EquipmentModifierContainerSheet, {
		types: ["eqp_modifier_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.eqp_modifier_container"),
	});
	Items.registerSheet(SYSTEM_NAME, NoteSheet, {
		types: ["note"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.note"),
	});
	Items.registerSheet(SYSTEM_NAME, NoteContainerSheet, {
		types: ["note_container"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.note_container"),
	});

	Actors.registerSheet(SYSTEM_NAME, CharacterSheetGURPS, {
		types: ["character_gcs"],
		makeDefault: true,
		label: i18n("gurps.system.sheet.character"),
	});
});

// Setup system
Hooks.once("setup", async () => {
	// Do anything after initialization but before ready
});

// When ready
Hooks.once("ready", async () => {
	// Do anything once the system is ready

	// Enable drag image
	const DRAG_IMAGE = document.createElement("div");
	DRAG_IMAGE.innerHTML = await renderTemplate(
		`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`,
		{
			name: "",
			type: "",
		},
	);
	DRAG_IMAGE.id = "drag-ghost";
	document.body.appendChild(DRAG_IMAGE);
	await Promise.all(
		g.actors!.map(async actor => {
			actor.prepareData();
		}),
	);

	// Render modifier app after user object loaded to avoid old data
	g.user?.setFlag(SYSTEM_NAME, "init", true);
	GURPS.ModifierButton = new ModifierButton();
	GURPS.ModifierButton.render(true);

	GURPS.CompendiumBrowser = new CompendiumBrowser();
});

// Add any additional hooks if necessary
Hooks.on("renderChatMessage", (_app, html, _data) =>
	Chat.addChatListeners(html),
);

Hooks.on(
	"renderSidebarTab",
	async (app: SidebarTab, html: JQuery<HTMLElement>) => {
		if (app.options.id === "compendium") {
			const importButton = $(
				"<button><i class='fas fa-file-import'></i>" +
					i18n("gurps.system.library_import.button") +
					"</button>",
			);
			importButton.on("click", _event => ItemImporter.showDialog());
			html.find(".directory-footer").append(importButton);

			const browseButton = $(
				"<button><i class='fas fa-book-open-cover'></i>" +
					i18n("gurps.compendium_browser.button") +
					"</button>",
			);
			browseButton.on("click", _event =>
				GURPS.CompendiumBrowser.render(true),
			);
			html.find(".directory-footer").append(browseButton);
		}
	},
);
