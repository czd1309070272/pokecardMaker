
import { BaseCardFields } from './models/base';
import { PokemonFields } from './models/pokemon';
import { TrainerFields } from './models/trainer';
import { ElementType, Supertype, Subtype, Rarity, HoloPattern } from './models/enums';

export * from './models/enums';
export * from './models/shared';
export * from './models/base';
export * from './models/pokemon';
export * from './models/trainer';

// Aggregated CardData to maintain backward compatibility
// This ensures that all properties expected by the existing components are present.
export interface CardData extends BaseCardFields, PokemonFields, TrainerFields {
    // Overrides or additional explicit shared fields if any collision issues arise
}

// Initial Data
export const INITIAL_CARD_DATA: CardData = {
  supertype: Supertype.Pokemon,
  name: 'Charizard',
  hp: '330',
  type: ElementType.Fire,
  subtype: Subtype.Stage2,
  evolvesFrom: 'Charmeleon',
  image: 'https://images.unsplash.com/photo-1633469924738-52101af51d87?q=80&w=1000&auto=format&fit=crop', 
  holoPattern: HoloPattern.Sheen,
  attacks: [
    {
      id: '1',
      name: 'Flare Blitz',
      cost: [ElementType.Fire, ElementType.Colorless],
      damage: '50',
      description: '',
    },
    {
      id: '2',
      name: 'Explosive Vortex',
      cost: [ElementType.Fire, ElementType.Fire, ElementType.Colorless, ElementType.Colorless],
      damage: '330',
      description: 'Discard 3 Energy from this Pokémon.',
    },
  ],
  rules: [], // Trainer/Energy rules
  retreatCost: 2,
  illustrator: '5ban Graphics',
  setNumber: '006/165',
  rarity: Rarity.DoubleRare,
  weakness: ElementType.Water,
  regulationMark: 'G',
  pokedexEntry: 'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.',
  dexSpecies: 'Flame Pokémon',
  dexHeight: "5'07\"",
  dexWeight: "199.5 lbs.",
  
  zoom: 1.2,
  xOffset: 0,
  yOffset: 0,
  likes: 0,
  isLiked: false
};
