import { i18n } from "@util";

export const SYSTEM_NAME = "gcsga";
export const SETTING_BASIC_SET_PDF = "basicsetpdf";

export function registerSettings(): void {
	// Register any custom system settings here
	//@ts-ignore
	game.settings.register(SYSTEM_NAME, "basicsetpdf", {
		name: i18n("gurps.settings.basic_set_pdfs.name"),
		hint: i18n("gurps.settings.basic_set_pdfs.name"),
		scope: "world",
		config: true,
		type: String,
		choices: {
			combined: i18n("gurps.settings.basic_set_pdfs.choices.combined"),
			separate: i18n("gurps.settings.basic_set_pdfs.choices.separate"),
		},
		default: "combined",
		onChange: (value: string) => console.log(`Basic Set PDFs : ${value}`),
	});
}
