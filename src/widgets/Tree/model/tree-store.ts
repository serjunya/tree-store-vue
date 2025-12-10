import { Item } from "../types/Item";
import { ItemId } from "../types/ItemId";

export class TreeStore {
    private items: Item[];
    private itemsMap: Map<ItemId, Item>;
    private childrenMap: Map<ItemId | null, ItemId[]>;

    constructor(items: Item[]) {
        this.items = items;
        this.itemsMap = new Map();
        this.childrenMap = new Map();

        this.initializeData(); // Метод для создания кэшей
    }

    private initializeData(): void {
        // 1. Создание itemsMap и childrenMap
        for (const item of this.items) {
            this.itemsMap.set(item.id, item);

            // Инициализация массива дочерних элементов для каждого родителя
            const parentId = item.parent;
            if (!this.childrenMap.has(parentId)) {
                this.childrenMap.set(parentId, []);
            }
            this.childrenMap.get(parentId)!.push(item.id);
        }
    }

    // ... методы
}
