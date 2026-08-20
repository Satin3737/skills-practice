import {ChatMessageSchema} from './zod/schemas/models/ChatMessage.schema';
import {ChatSessionSchema} from './zod/schemas/models/ChatSession.schema';
import {MissionSchema} from './zod/schemas/models/Mission.schema';
import {PlanetSchema} from './zod/schemas/models/Planet.schema';
import {StormtrooperSchema} from './zod/schemas/models/Stormtrooper.schema';
import {UserSchema} from './zod/schemas/models/User.schema';
import {WeaponSchema} from './zod/schemas/models/Weapon.schema';

export const UserPlain = UserSchema;
export const StormtrooperPlain = StormtrooperSchema;
export const MissionPlain = MissionSchema;
export const PlanetPlain = PlanetSchema;
export const WeaponPlain = WeaponSchema;
export const ChatSessionPlain = ChatSessionSchema;
export const ChatMessagePlain = ChatMessageSchema;
