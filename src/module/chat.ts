import { ActorGURPS } from "@actor";
import { RollGURPS } from "@util";
import { RollModifier, RollType } from "./data";
import { GURPS } from "./gurps";

/**
 *
 * @param html
 */
export function addChatListeners(html: JQuery<HTMLElement>): void {
	html.find(".rollable.damage").on("click", event => _onDamageRoll(event));
	html.find(".rollable").on("mouseover", event => _onRollableHover(event, true));
	html.find(".rollable").on("mouseout", event => _onRollableHover(event, false));
	html.find(".mod").on("click", event => _onModClick(event));
}

/**
 *
 * @param event
 */
async function _onModClick(event: JQuery.ClickEvent): Promise<void> {
	event.preventDefault();
	const mod: RollModifier = $(event.currentTarget).data("mod");
	await GURPS.ModifierButton.window.addModifier(mod);
}

/**
 *
 * @param event
 */
async function _onDamageRoll(event: JQuery.ClickEvent) {
	event.preventDefault();
	const actor = (game as Game).actors!.get($(event.currentTarget).data("actorId")) as ActorGURPS;
	const type: RollType = $(event.currentTarget).data("type");
	const data: { [key: string]: any } = { type: type };
	if (
		[
			RollType.Damage,
			RollType.Attack,
			RollType.Skill,
			RollType.SkillRelative,
			RollType.Spell,
			RollType.SpellRelative,
		].includes(type)
	)
		data.item = actor!.deepItems.get($(event.currentTarget).data("item-id"));
	if ([RollType.Damage, RollType.Attack].includes(type))
		data.weapon = data.item.weapons.get($(event.currentTarget).data("attack-id"));
	if (type == RollType.Modifier) {
		data.modifier = $(event.currentTarget).data("modifier");
		data.comment = $(event.currentTarget).data("comment");
	}
	return RollGURPS.handleRoll((game as Game).user, actor, data);
}

/**
 *
 * @param event
 * @param hover
 */
async function _onRollableHover(event: JQuery.MouseOverEvent | JQuery.MouseOutEvent, hover: boolean) {
	event.preventDefault();
	if (hover) event.currentTarget.classList.add("hover");
	else event.currentTarget.classList.remove("hover");
}
