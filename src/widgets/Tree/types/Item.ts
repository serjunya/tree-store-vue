import type { ItemId } from './ItemId';

export interface Item {
    id: ItemId;
    parent: ItemId | null;
    label: string;
}
