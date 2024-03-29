// SPDX-FileCopyrightText: 2023 Johannes Loher
// SPDX-FileCopyrightText: 2023 David Archibald
//
// SPDX-License-Identifier: MIT

import typescript from "@rollup/plugin-typescript"
import { nodeResolve } from "@rollup/plugin-node-resolve"

export default () => ({
	input: "src/module/gurps.ts",
	output: {
		dir: "dist/module",
		format: "es",
		sourcemap: true,
	},
	plugins: [nodeResolve(), typescript()],
})
