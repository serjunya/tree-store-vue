import type { Item } from '../types/Item';
import type { ItemId } from '../types/ItemId';

export class TreeStore {
    private items: Item[];
    private itemsMap: Map<ItemId, Item>;
    private childrenMap: Map<ItemId | null, ItemId[]>;

    constructor(items: Item[]) {
        this.items = [...items];
        this.itemsMap = new Map();
        this.childrenMap = new Map();

        this.initializeData(); // Метод для создания кэшей
    }

    private initializeData(): void {
        // Очищаем мапы
        this.itemsMap.clear();
        this.childrenMap.clear();

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

    getAll(): Item[] {
        return [...this.items];
    }

    getItem(id: ItemId): Item | undefined {
        return this.itemsMap.get(id);
    }

    getChildren(id: ItemId): ItemId[] {
        return [...(this.childrenMap.get(id) || [])];
    }

    getAllChildren(id: ItemId): ItemId[] {
        const result: ItemId[] = [];
        const queue: ItemId[] = [...(this.childrenMap.get(id) || [])];

        while (queue.length > 0) {
            const currentNodeId = queue.shift()!;
            result.push(currentNodeId);

            const children = this.childrenMap.get(currentNodeId) || [];
            queue.push(...children);
        }

        return result;
    }

    getAllParents(id: ItemId): ItemId[] {
        const result: ItemId[] = [];
        let currentNode = this.getItem(id);

        while (currentNode && currentNode.parent !== null) {
            const parent = this.getItem(currentNode.parent);
            if (parent) {
                result.push(parent.id);
                currentNode = parent;
            } else {
                break;
            }
        }

        return result;
    }

    addItem(item: Item): void {
        // Проверяем, существует ли элемент с таким id
        if (this.itemsMap.has(item.id)) {
            throw new Error(`Элемент с id "${item.id}" уже существует`);
        }

        // Проверяем, существует ли родитель (если указан)
        if (item.parent !== null && !this.itemsMap.has(item.parent)) {
            throw new Error(`Родительский элемент с id "${item.parent}" не существует`);
        }

        // Добавляем элемент
        this.items.push(item);
        this.itemsMap.set(item.id, item);

        // Обновляем childrenMap
        if (!this.childrenMap.has(item.parent)) {
            this.childrenMap.set(item.parent, []);
        }
        this.childrenMap.get(item.parent)!.push(item.id);
    }

    removeItem(id: ItemId): void {
        const itemToRemove = this.getItem(id);
        if (!itemToRemove) {
            throw new Error(`Элемент с id "${id}" не существует`);
        }

        // Получаем все дочерние элементы (включая вложенные)
        const allChildrenIds = this.getAllChildren(id);

        // Удаляем элемент и всех его потомков из items
        const idsToRemove = [id, ...allChildrenIds];
        this.items = this.items.filter((item) => !idsToRemove.includes(item.id));

        // Перестраиваем мапы
        this.initializeData();
    }

    updateItem(updatedItem: Item): void {
        const existingItem = this.getItem(updatedItem.id);
        if (!existingItem) {
            throw new Error(`Элемент с id "${updatedItem.id}" не существует`);
        }

        // Проверяем, существует ли новый родитель (если изменился parent)
        if (updatedItem.parent !== null && !this.itemsMap.has(updatedItem.parent)) {
            throw new Error(`Родительский элемент с id "${updatedItem.parent}" не существует`);
        }

        // Находим индекс элемента
        const index = this.items.findIndex((item) => item.id === updatedItem.id);
        if (index !== -1) {
            // Обновляем элемент
            this.items[index] = { ...updatedItem };

            // Если изменился parent, нужно перестроить структуру
            if (existingItem.parent !== updatedItem.parent) {
                this.initializeData();
            } else {
                // Иначе просто обновляем элемент в itemsMap
                this.itemsMap.set(updatedItem.id, this.items[index]);
            }
        }
    }
}
