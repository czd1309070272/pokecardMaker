
import { ElementType, Subtype } from './enums';
import { Attack } from './shared';

export interface PokemonFields {
  hp: string;
  type: ElementType;
  subtype: Subtype | string;
  evolvesFrom?: string;
  weakness?: ElementType;
  resistance?: ElementType;
  retreatCost: number;
  attacks: Attack[];
  pokedexEntry?: string;
  dexSpecies?: string;
  dexHeight?: string;
  dexWeight?: string;
}
