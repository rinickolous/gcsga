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
import { i18n, registerHandlebarsHelpers } from "@util";
import { CharacterSheetGURPS } from "@actor/sheet";
import { BaseActorGURPS } from "@actor/base";
import { BaseItemGURPS } from "@item";
import { GURPSCONFIG } from "./config";
import { TraitSheet } from "@item/trait/sheet";
import { ActorGURPS } from "@actor";

export const GURPS: any = {};
(window as any).GURPS = GURPS;
GURPS.DEBUG = true;
GURPS.LEGAL = `GURPS is a trademark of Steve Jackson Games, and its rules and art are copyrighted by Steve Jackson Games.\nAll rights are reserved by Steve Jackson Games.\nThis game aid is the original creation of Mikolaj Tomczynski and is released for free distribution, and not for resale, under the permissions granted by\nhttp://www.sjgames.com/general/online_policy.html`;
GURPS.BANNER = `
   __   ____   ____  ____    ____     _     __  
  / /  / ___| / ___|/ ___|  / ___|   / \\    \\ \\ 
 / /  | |  _ | |    \\___ \\ | |  _   / _ \\    \\ \\
 \\ \\  | |_| || |___  ___) || |_| | / ___ \\   / /
  \\_\\  \\____| \\____||____/  \\____|/_/   \\_\\ /_/ `;

// Initialize system
Hooks.once("init", async () => {
	console.log(`${SYSTEM_NAME} | Initializing ${SYSTEM_NAME}`);
	console.log(GURPS.BANNER);
	console.log(GURPS.LEGAL);

	const src = `systems/${SYSTEM_NAME}/assets/gcsga.webp`;
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
	Items.unregisterSheet("core", ItemSheet);
	Actors.unregisterSheet("core", ActorSheet);

	Items.registerSheet(SYSTEM_NAME, TraitSheet, {
		types: ["trait"],
		makeDefault: true,
		label: i18n("gcsga.system.sheet.trait"),
	});

	Actors.registerSheet(SYSTEM_NAME, CharacterSheetGURPS, {
		types: ["character"],
		makeDefault: true,
		label: i18n("gcsga.system.sheet.character"),
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
	DRAG_IMAGE.innerHTML = await renderTemplate(`systems/${SYSTEM_NAME}/templates/actor/drag-image.hbs`, {
		name: "",
		type: "",
	});
	DRAG_IMAGE.id = "drag-ghost";
	document.body.appendChild(DRAG_IMAGE);
	await Promise.all(
		(game as Game).actors!.map(async actor => {
			actor.prepareData();
		}),
	);
});

// Add any additional hooks if necessary
