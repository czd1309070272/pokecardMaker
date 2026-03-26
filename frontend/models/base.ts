
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
  isFavorited?: boolean;
  isPublic?: boolean;
  isDeleted?: boolean;
  status?: string;
  publishedAt?: string;
  deletedAt?: string;
  favoritedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  authorName?: string;
  appraisal?: {
    price: string;
    comment: string;
    language?: string;
    appraisedAt?: string;
  };
}
