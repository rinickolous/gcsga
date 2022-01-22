const typescript = require("@rollup/plugin-typescript");
const { nodeResolve } = require("@rollup/plugin-node-resolve");

module.exports = {
	input: "src/module/gcsga.ts",
	output: {
		dir: "dist/module",
		format: "es",
		sourcemap: true,
	},
	plugins: [nodeResolve(), typescript({ noEmitOnError: true })],
};
