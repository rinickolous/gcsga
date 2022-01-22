import { CharacterData, CharacterSource } from "@actor/character/data";

export type ActorDataGURPS = CharacterData;
// | ElementData
// | VehicleData
// | MerchantData
// | TrapData;

export type ActorSourceGURPS = ActorDataGURPS["_source"];

export type {
	CharacterData,
	// ElementData,
	// VehicleData,
	// MerchantData,
	// TrapData,
};

export {
	CharacterSource,
	// ElementSource,
	// VehicleSource,
	// MerchantSource,
	// TrapSource,
};
