import { i18n, i18n_f, signed } from "./misc"

export class LeveledAmount {
	level = 0

	amount = 1

	per_level = false

	constructor(data?: { level: number; amount: number; per_level: boolean }) {
		if (data) Object.assign(this, data)
	}

	formatWithLevel(asPercentage: boolean, what: string = i18n("gurps.feature.level")): string {
		let amt = signed(this.amount)
		if (asPercentage) amt += "%"
		if (this.per_level) {
			let leveled = signed(this.adjustedAmount)
			if (asPercentage) leveled += "%"
			return i18n_f("gurps.feature.per_level_text", { leveled: leveled, amt: amt, what: what })
		}
		return amt
	}

	format(what: string): string {
		const per_level = signed(this.amount)
		if (this.per_level)
			return i18n_f("gurps.feature.format", {
				total: signed(this.adjustedAmount),
				per_level,
				what,
			})
		return per_level
	}

	get adjustedAmount(): number {
		if (this.per_level) {
			if (this.level < 0) return 0
			return this.amount * this.level
		}
		return this.amount
	}
}

export interface LeveledAmount {
	level: number
	amount: number
	per_level: boolean
}
