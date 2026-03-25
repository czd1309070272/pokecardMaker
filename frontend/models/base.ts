
import { Supertype, HoloPattern, Rarity } from './enums';

export interface BaseCardFields {
  id?: string;
  supertype: Supertype;
  name: string;
  image?: string;
  holoPattern: HoloPattern;
  illustrator: string;
  setNumber: string;
  rarity: Rarity;
  regulationMark?: string;
  setSymbolImage?: string;
  zoom: number;
  xOffset: number;
  yOffset: number;
  likes?: number;
  isLiked?: boolean;
}
