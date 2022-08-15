import { ActorGURPS } from "@actor";
import { RollType } from "@module/data";
import { SYSTEM_NAME } from "@module/settings";

export async function handleRoll(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): Promise<void> {
	console.log(user, actor, data);
	switch (data.type) {
		case RollType.Modifier:
			return addModifier(user, actor, data);
		case RollType.Skill:
		case RollType.SkillRelative:
		case RollType.Spell:
		case RollType.SpellRelative:
		case RollType.Attack:
			return rollSkill(user, actor, data);
		case RollType.Damage:
			return rollDamage(user, actor, data);
	}
	if (data.type == RollType.Modifier) addModifier(user, actor, data);
}

function addModifier(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }) {
	if (!user) return;
	throw new Error("Function not implemented.");
}

export async function rollSkill(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): Promise<void> {
	const formula = "3d6";
	const roll = Roll.create(formula);
	console.log(user, actor, data);
	await roll.evaluate({ async: true });
	let rollTotal = roll.total;
	const speaker = ChatMessage.getSpeaker({ actor: actor as any });

	// Set up Chat Data
	const chatData: { [key: string]: any } = {};
	chatData.text = `<b>${data.item.name}</b> - ${data.item.skillLevel}/${data.item.relativeLevel}`;
	chatData.success = "";
	chatData.total = rollTotal;
	chatData.margin = rollTotal;

	const message = await renderTemplate(`systems/${SYSTEM_NAME}/templates/message/skill-roll.hbs`, chatData);

	console.log(roll.dice[0].results);

	const messageData = {
		user: user,
		speaker: speaker,
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		content: message,
		roll: JSON.stringify(roll),
		sound: CONFIG.sounds.dice,
	};
	ChatMessage.create(messageData, {});
}

function rollDamage(user: StoredDocument<User> | null, actor: ActorGURPS, data: { [key: string]: any }): void {
	throw new Error("Function not implemented.");
}
