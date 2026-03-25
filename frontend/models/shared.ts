
import { ElementType } from './enums';

export interface Attack {
  id: string;
  name: string;
  cost: ElementType[];
  damage: string;
  description: string;
}

export interface User {
    email: string;
    name: string;
    created?: string;
    coins?: number;
    lastDailyDraw?: string;
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}
