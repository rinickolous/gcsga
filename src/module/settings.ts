import { i18n } from "@util";

export const SYSTEM_NAME = "gcsga";
export const SETTING_BASIC_SET_PDF = "basicsetpdf";

export function registerSettings(): void {
	// Register any custom system settings here
	game.settings.register(SYSTEM_NAME, "basicsetpdf", {
		name: i18n("gcsga.settings.basic_set_pdfs.name"),
		hint: i18n("gcsga.settings.basic_set_pdfs.hint"),
		scope: "world",
		config: true,
		type: String,
		choices: {
			combined: i18n("gcsga.settings.basic_set_pdfs.choices.combined"),
			separate: i18n("gcsga.settings.basic_set_pdfs.choices.separate"),
		},
		default: "combined",
		onChange: (value: string) => console.log(`Basic Set PDFs : ${value}`),
	});

	game.settings.register(SYSTEM_NAME, "portrait_path", {
		name: i18n("gcsga.settings.portrait_path.name"),
		hint: i18n("gcsga.settings.portrait_path.hint"),
		scope: "world",
		config: true,
		type: String,
		choices: {
			global: i18n("gcsga.settings.portrait_path.choices.global"),
			local: i18n("gcsga.settings.portrait_path.choices.local"),
		},
		default: "global",
		onChange: (value: string) => console.log(`Basic Set PDFs : ${value}`),
	});
}
