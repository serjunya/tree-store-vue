import { TreeStore } from '@/widgets/Tree/model/tree-store';
import { describe, expect, it } from 'vitest';

const mockData = [
    { id: 1, parent: null, label: 'Айтем 1' },
    { id: '91064cee', parent: 1, label: 'Айтем 2' },
    { id: 3, parent: 1, label: 'Айтем 3' },
    { id: 4, parent: '91064cee', label: 'Айтем 4' },
    { id: 5, parent: '91064cee', label: 'Айтем 5' },
    { id: 6, parent: '91064cee', label: 'Айтем 6' },
    { id: 7, parent: 4, label: 'Айтем 7' },
    { id: 8, parent: 4, label: 'Айтем 8' },
];

describe('TreeStore', () => {
    const treeStore = new TreeStore(mockData);

    it('стор создаётся с переданными данными', () => {
        expect(JSON.stringify(treeStore.getAll())).toEqual(JSON.stringify(mockData));
    });

    it('можно получить элемент по id', () => {
        expect(treeStore.getItem(3)).toHaveProperty('label', 'Айтем 3');
    });

    it('children заполняются корректно', () => {
        expect(treeStore.getChildren('91064cee')).toHaveLength(3);
    });

    it('можно получить всех родителей айтема до корня', () => {
        expect(JSON.stringify(treeStore.getAllParents(7))).toEqual(
            JSON.stringify([4, '91064cee', 1]),
        );
    });
});
