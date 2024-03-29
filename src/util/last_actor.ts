import { ActorGURPS } from "@module/config"
import { ActorType, SYSTEM_NAME } from "@module/data"
// Import { LocalizeGURPS } from "./localize"

export class LastActor {
	static async set(actor: ActorGURPS, token?: TokenDocument): Promise<void> {
		if (actor.type === ActorType.Loot) return
		await game.user?.setFlag(SYSTEM_NAME, "last_actor", actor.uuid)
		if (token) await game.user?.setFlag(SYSTEM_NAME, "last_token", token.uuid)
		await game.ModifierButton.render()
	}

	static async get(): Promise<ActorGURPS | null> {
		const uuid: string = String(game.user?.getFlag(SYSTEM_NAME, "last_actor")) || ""
		let actor: any = await fromUuid(uuid)
		if (actor instanceof TokenDocument) actor = actor.actor
		if (actor) return actor
		// Ui.notifications?.error(LocalizeGURPS.translations.gurps.error.no_last_actor);
		return null
	}

	static async getToken(): Promise<TokenDocument | null> {
		const uuid: string = String(game.user?.getFlag(SYSTEM_NAME, "last_token")) || ""
		const token: any = await fromUuid(uuid)
		if (token) return token
		return null
	}

	static async clear(a: ActorGURPS) {
		if (a.type === ActorType.Loot) return
		const currentLastActor = await LastActor.get()
		if (currentLastActor === a) {
			game.user?.setFlag(SYSTEM_NAME, "last_actor", null)
			const tokens = canvas?.tokens
			if (tokens && tokens.controlled!.length! > 0) {
				LastActor.set(tokens.controlled[0]?.actor as ActorGURPS)
			}
		}
	}
}
