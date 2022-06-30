module.exports = {
	parser: "@typescript-eslint/parser",

	parserOptions: {
		ecmaVersion: 2020,
		extraFileExtensions: [".cjs", ".mjs"],
		sourceType: "module",
		project: "./tsconfig.eslint.json",
	},

	env: {
		browser: true,
	},

	extends: ["plugin:@typescript-eslint/recommended", "plugin:jest/recommended", "plugin:prettier/recommended"],

	plugins: ["@typescript-eslint", "jest"],

	rules: {
		// Specify any specific ESLint rules.
		"@typescript-eslint/ban-ts-comment": "warn",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-non-null-assertion": "off",
		// "prefer-const": "off",
	},

	overrides: [
		{
			files: ["./*.cjs"],
			rules: {
				"@typescript-eslint/no-var-requires": "off",
			},
		},
	],
};
