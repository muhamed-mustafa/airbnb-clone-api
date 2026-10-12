import { CreateUnitInput } from '@application/units/inputs/create-unit.input';

export type UpdateUnitInput = Partial<Omit<CreateUnitInput, 'user'>>;
