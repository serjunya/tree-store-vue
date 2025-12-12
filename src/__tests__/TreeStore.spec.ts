import { TreeStore } from '@/widgets/Tree/model/tree-store';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Item } from '@/widgets/Tree/types/Item';

describe('tree-store', () => {
    let mockItems: Item[];
    let treeStore: TreeStore;

    beforeEach(() => {
        mockItems = [
            { id: 1, parent: null, label: 'Корень' },
            { id: 2, parent: 1, label: 'Дочерний 1' },
            { id: 3, parent: 1, label: 'Дочерний 2' },
            { id: 4, parent: 2, label: 'Внучатый 1' },
            { id: 5, parent: 2, label: 'Внучатый 2' },
            { id: 'six', parent: 3, label: 'Внучатый 3' },
            { id: 'seven', parent: null, label: 'Второй корень' },
        ];

        treeStore = new TreeStore(mockItems);
    });

    describe('Конструктор и getAll', () => {
        it('должен корректно инициализироваться с переданными элементами', () => {
            expect(treeStore.getAll()).toEqual(mockItems);
            expect(treeStore.getAll()).not.toBe(mockItems); // Проверяем, что возвращается копия
        });

        it('должен корректно обрабатывать пустой массив', () => {
            const emptyStore = new TreeStore([]);
            expect(emptyStore.getAll()).toEqual([]);
        });
    });

    describe('getItem', () => {
        it('должен возвращать элемент по числовому id', () => {
            expect(treeStore.getItem(1)).toEqual(mockItems[0]);
            expect(treeStore.getItem(2)).toEqual(mockItems[1]);
        });

        it('должен возвращать элемент по строковому id', () => {
            expect(treeStore.getItem('six')).toEqual(mockItems[5]);
            expect(treeStore.getItem('seven')).toEqual(mockItems[6]);
        });

        it('должен возвращать undefined для несуществующего id', () => {
            expect(treeStore.getItem(999)).toBeUndefined();
            expect(treeStore.getItem('nonexistent')).toBeUndefined();
        });
    });

    describe('getChildren', () => {
        it('должен возвращать прямых детей элемента', () => {
            expect(treeStore.getChildren(1)).toEqual([2, 3]);
            expect(treeStore.getChildren(2)).toEqual([4, 5]);
            expect(treeStore.getChildren(3)).toEqual(['six']);
        });

        it('должен возвращать пустой массив для элемента без детей', () => {
            expect(treeStore.getChildren(4)).toEqual([]);
            expect(treeStore.getChildren('six')).toEqual([]);
        });

        it('должен возвращать корневые элементы при parent = null', () => {
            expect(treeStore.getChildren(null)).toEqual([1, 'seven']);
        });

        it('должен возвращать пустой массив для несуществующего элемента', () => {
            expect(treeStore.getChildren(999)).toEqual([]);
        });
    });

    describe('getAllChildren', () => {
        it('должен возвращать всех потомков элемента', () => {
            expect(treeStore.getAllChildren(1)).toEqual([2, 3, 4, 5, 'six']);
            expect(treeStore.getAllChildren(2)).toEqual([4, 5]);
            expect(treeStore.getAllChildren(3)).toEqual(['six']);
        });

        it('должен возвращать пустой массив для элемента без потомков', () => {
            expect(treeStore.getAllChildren(4)).toEqual([]);
            expect(treeStore.getAllChildren('six')).toEqual([]);
        });

        it('должен возвращать пустой массив для несуществующего элемента', () => {
            expect(treeStore.getAllChildren(999)).toEqual([]);
        });
    });

    describe('getAllParents', () => {
        it('должен возвращать цепочку родителей от элемента до корня', () => {
            expect(treeStore.getAllParents(4)).toEqual([2, 1]);
            expect(treeStore.getAllParents('six')).toEqual([3, 1]);
            expect(treeStore.getAllParents(2)).toEqual([1]);
        });

        it('должен возвращать пустой массив для корневого элемента', () => {
            expect(treeStore.getAllParents(1)).toEqual([]);
            expect(treeStore.getAllParents('seven')).toEqual([]);
        });

        it('должен возвращать пустой массив для несуществующего элемента', () => {
            expect(treeStore.getAllParents(999)).toEqual([]);
        });
    });

    describe('addItem', () => {
        it('должен добавлять новый элемент', () => {
            const newItem: Item = { id: 8, parent: 2, label: 'Новый элемент' };

            treeStore.addItem(newItem);

            expect(treeStore.getItem(8)).toEqual(newItem);
            expect(treeStore.getChildren(2)).toContain(8);
            expect(treeStore.getAll()).toHaveLength(mockItems.length + 1);
        });

        it('должен добавлять новый корневой элемент', () => {
            const newItem: Item = { id: 9, parent: null, label: 'Новый корень' };

            treeStore.addItem(newItem);

            expect(treeStore.getItem(9)).toEqual(newItem);
            expect(treeStore.getChildren(null)).toContain(9);
        });

        it('должен выбрасывать ошибку при добавлении элемента с существующим id', () => {
            const duplicateItem: Item = { id: 1, parent: null, label: 'Дубликат' };

            expect(() => treeStore.addItem(duplicateItem)).toThrow(
                'Элемент с id "1" уже существует',
            );
        });

        it('должен выбрасывать ошибку при добавлении элемента с несуществующим родителем', () => {
            const itemWithInvalidParent: Item = { id: 10, parent: 999, label: 'Элемент' };

            expect(() => treeStore.addItem(itemWithInvalidParent)).toThrow(
                'Родительский элемент с id "999" не существует',
            );
        });

        it('должен корректно добавлять элемент с строковым id', () => {
            const newItem: Item = { id: 'new-item', parent: 1, label: 'Строковый id' };

            treeStore.addItem(newItem);

            expect(treeStore.getItem('new-item')).toEqual(newItem);
            expect(treeStore.getChildren(1)).toContain('new-item');
        });
    });

    describe('removeItem', () => {
        it('должен удалять элемент и всех его потомков', () => {
            treeStore.removeItem(2);

            expect(treeStore.getItem(2)).toBeUndefined();
            expect(treeStore.getItem(4)).toBeUndefined();
            expect(treeStore.getItem(5)).toBeUndefined();
            expect(treeStore.getAll()).toHaveLength(mockItems.length - 3); // Удалено 3 элемента
        });

        it('должен корректно удалять элемент без потомков', () => {
            treeStore.removeItem(4);

            expect(treeStore.getItem(4)).toBeUndefined();
            expect(treeStore.getChildren(2)).toEqual([5]);
            expect(treeStore.getAll()).toHaveLength(mockItems.length - 1);
        });

        it('должен корректно удалять элемент со строковым id', () => {
            treeStore.removeItem('six');

            expect(treeStore.getItem('six')).toBeUndefined();
            expect(treeStore.getChildren(3)).toEqual([]);
            expect(treeStore.getAll()).toHaveLength(mockItems.length - 1);
        });

        it('должен выбрасывать ошибку при удалении несуществующего элемента', () => {
            expect(() => treeStore.removeItem(999)).toThrow('Элемент с id "999" не существует');
        });

        it('должен обновлять childrenMap после удаления', () => {
            treeStore.removeItem(4);

            // Проверяем, что childrenMap обновился
            expect(treeStore.getChildren(2)).toEqual([5]);
            expect(treeStore.getAllChildren(2)).toEqual([5]);
        });
    });

    describe('updateItem', () => {
        it('должен обновлять существующий элемент', () => {
            const updatedItem: Item = { id: 2, parent: 1, label: 'Обновленная метка' };

            treeStore.updateItem(updatedItem);

            expect(treeStore.getItem(2)).toEqual(updatedItem);
            expect(treeStore.getAll()).toHaveLength(mockItems.length);
        });

        it('должен обновлять родителя элемента', () => {
            const updatedItem: Item = { id: 4, parent: 3, label: 'Перемещенный элемент' };

            treeStore.updateItem(updatedItem);

            expect(treeStore.getItem(4)?.parent).toBe(3);
            expect(treeStore.getChildren(2)).toEqual([5]);
            expect(treeStore.getChildren(3)).toEqual([4, 'six']);
        });

        it('должен выбрасывать ошибку при обновлении несуществующего элемента', () => {
            const nonExistentItem: Item = { id: 999, parent: 1, label: 'Не существует' };

            expect(() => treeStore.updateItem(nonExistentItem)).toThrow(
                'Элемент с id "999" не существует',
            );
        });

        it('должен выбрасывать ошибку при обновлении с несуществующим родителем', () => {
            const itemWithInvalidParent: Item = { id: 2, parent: 999, label: 'Элемент' };

            expect(() => treeStore.updateItem(itemWithInvalidParent)).toThrow(
                'Родительский элемент с id "999" не существует',
            );
        });

        it('должен корректно обновлять элемент со строковым id', () => {
            const updatedItem: Item = { id: 'six', parent: 1, label: 'Обновлен' };

            treeStore.updateItem(updatedItem);

            expect(treeStore.getItem('six')).toEqual(updatedItem);
            expect(treeStore.getChildren(3)).toEqual([]);
            expect(treeStore.getChildren(1)).toEqual([2, 3, 'six']);
        });

        it('не должен перестраивать мапы если parent не изменился', () => {
            const originalItem = treeStore.getItem(2);
            const updatedItem: Item = { id: 2, parent: 1, label: 'Только метка изменена' };

            // Сохраняем ссылку на исходный объект
            const originalObject = originalItem;

            treeStore.updateItem(updatedItem);

            // Проверяем, что метка обновилась
            expect(treeStore.getItem(2)?.label).toBe('Только метка изменена');
            // Проверяем, что объект в itemsMap обновился (новая ссылка)
            expect(treeStore.getItem(2)).not.toBe(originalObject);
        });
    });

    describe('Интеграционные тесты', () => {
        it('должен корректно работать с комплексными операциями', () => {
            // Добавляем элемент
            const newItem: Item = { id: 8, parent: 4, label: 'Новый' };
            treeStore.addItem(newItem);

            expect(treeStore.getAllChildren(2)).toEqual([4, 5, 8]);

            // Обновляем элемент
            treeStore.updateItem({ id: 8, parent: 5, label: 'Перемещен' });
            expect(treeStore.getAllChildren(2)).toEqual([4, 5, 8]);
            expect(treeStore.getChildren(4)).toEqual([]);
            expect(treeStore.getChildren(5)).toEqual([8]);

            // Удаляем ветку
            treeStore.removeItem(2);
            expect(treeStore.getItem(2)).toBeUndefined();
            expect(treeStore.getItem(4)).toBeUndefined();
            expect(treeStore.getItem(5)).toBeUndefined();
            expect(treeStore.getItem(8)).toBeUndefined();

            // Проверяем оставшиеся элементы
            expect(treeStore.getAll()).toHaveLength(mockItems.length - 3);
            expect(treeStore.getChildren(1)).toEqual([3]);
        });

        it('должен корректно обрабатывать смешанные типы id', () => {
            const items: Item[] = [
                { id: 'root', parent: null, label: 'Корень' },
                { id: 1, parent: 'root', label: 'Число' },
                { id: 'child', parent: 1, label: 'Строка' },
            ];

            const store = new TreeStore(items);

            expect(store.getChildren('root')).toEqual([1]);
            expect(store.getChildren(1)).toEqual(['child']);
            expect(store.getAllParents('child')).toEqual([1, 'root']);
        });
    });
});
