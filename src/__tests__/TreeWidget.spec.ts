/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, type Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import TreeWidget from '@/widgets/Tree/ui/TreeWidget.vue';
import { TreeStore } from '@/widgets/Tree/model/tree-store';
import type { Item } from '@/widgets/Tree/types/Item';

// Мокаем TreeStore и ag-grid-vue3, так как они тестируются отдельно
vi.mock('@/widgets/Tree/model/tree-store', () => {
    const TreeStore = vi.fn(
        class {
            getAll = vi.fn(() => mockTreeData);
            getAllParents = vi.fn((id: string) => {
                if (id === '2') return ['1'];
                if (id === '3') return ['1'];
                if (id === '5') return ['4'];
                return [];
            });
            getChildren = vi.fn((id: string) => {
                if (id === '1')
                    return [
                        { id: '2', parent: '1', label: 'Child 1.1' },
                        { id: '3', parent: '1', label: 'Child 1.2' },
                    ];
                if (id === '4') return [{ id: '5', parent: '4', label: 'Child 2.1' }];
                return [];
            });
        },
    );
    return { TreeStore };
});

vi.mock('ag-grid-vue3', () => {
  const AgGridVue = {
    name: 'AgGridVue',
    template: '<div class="ag-grid-mock" data-testid="ag-grid-mock"></div>',
    props: [
      'treeData',
      'rowData',
      'getDataPath',
      'columnDefs',
      'autoGroupColumnDef',
      'onRowGroupOpened',
      'style'
    ],
    setup() {
      return {};
    },
  };
  return { AgGridVue };
});

const mockTreeData: Item[] = [
    { id: '1', parent: null, label: 'Root 1' },
    { id: '2', parent: '1', label: 'Child 1.1' },
    { id: '3', parent: '1', label: 'Child 1.2' },
    { id: '4', parent: null, label: 'Root 2' },
    { id: '5', parent: '4', label: 'Child 2.1' },
];

describe('TreeWidget.vue', () => {
    describe('Инициализация', () => {
        it('должен создавать TreeStore с переданными данными', () => {
            mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            expect(TreeStore).toHaveBeenCalledWith(mockTreeData);
        });

        it('должен передавать rowData из TreeStore', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            expect(wrapper.vm.treeStore!.getAll).toHaveBeenCalled();

            // Проверяем, что данные передаются в ag-grid
            const agGrid = wrapper.findComponent({ name: 'ag-grid-vue' });
            expect(agGrid.exists()).toBe(true);
        });
    });

    describe('getDataPath функция', () => {
        it('должен возвращать правильный путь для элемента без родителя', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            // Получаем экземпляр компонента для доступа к методам
            const vm = wrapper.vm;

            const item: Item = { id: '1', parent: null, label: 'Root 1' };
            const result = vm.getDataPath!(item);

            expect(result).toEqual(['1']);
        });

        it('должен возвращать правильный путь для элемента с родителем', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;


            const item: Item = { id: '2', parent: '1', label: 'Child 1.1' };
            const result = vm.getDataPath!(item);

            expect(result).toEqual(['1', '2']);
            expect(vm.treeStore!.getAllParents).toHaveBeenCalledWith('2');
        });
    });

    describe('autoGroupColumnDef', () => {
        it('должен правильно определять тип элемента (Группа/Элемент)', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;
            const valueGetter = vm.autoGroupColumnDef!.valueGetter;

            // Тестируем для группы
            const groupParams: any = {
                data: { id: '1', parent: null, label: 'Root 1' },
            };
            const groupResult = valueGetter(groupParams);
            expect(groupResult).toBe('Группа');
            expect(vm.treeStore!.getChildren).toHaveBeenCalledWith('1');

            // Сброс мока для следующего вызова
            (vm.treeStore!.getChildren as Mock).mockClear();

            // Тестируем для листового элемента
            (vm.treeStore!.getChildren as Mock).mockReturnValue([]);
            const leafParams: any = {
                data: { id: '2', parent: '1', label: 'Child 1.1' },
            };
            const leafResult = valueGetter(leafParams);
            expect(leafResult).toBe('Элемент');
            expect(vm.treeStore!.getChildren).toHaveBeenCalledWith('2');
        });

        it('должен иметь правильные параметры колонки', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;

            expect(vm.autoGroupColumnDef!.headerName).toBe('Категория');
            expect(vm.autoGroupColumnDef!.width).toBe(300);
            expect(vm.autoGroupColumnDef!.cellRendererParams).toEqual({
                suppressCount: true,
            });
        });
    });

    describe('columnDefs', () => {
        it('должен содержать колонку с номерами строк', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;
            const numColumn: any = vm.columnDefs?.[0];

            expect(numColumn).toBeDefined();
            expect(numColumn!.headerName).toBe('№ п\\п');
            expect(numColumn!.colId).toBe('num');
            expect(numColumn!.lockPosition).toBe('left');
            expect(numColumn!.width).toBe(80);
        });

        it('должен содержать колонку с наименованием', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;
            const labelColumn: any = vm.columnDefs?.[1];

            expect(labelColumn).toBeDefined();
            expect(labelColumn!.headerName).toBe('Наименование');
            expect(labelColumn!.field).toBe('label');
        });

        it('valueGetter для номеров строк должен возвращать правильный индекс', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;
            const numColumn: any = vm.columnDefs?.[0];
            const valueGetter = numColumn?.valueGetter;

            // Тест с существующим rowIndex
            const paramsWithIndex = {
                node: { rowIndex: 2 },
            };
            expect(valueGetter(paramsWithIndex)).toBe(3);

            // Тест без rowIndex
            const paramsWithoutIndex = {
                node: { rowIndex: null },
            };
            expect(valueGetter(paramsWithoutIndex)).toBe('');

            // Тест без node
            const paramsWithoutNode = {};
            expect(valueGetter(paramsWithoutNode)).toBe('');
        });
    });

    describe('onRowGroupOpened', () => {
        it('должен вызывать refreshCells с правильными параметрами', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;

            // Мокаем метод refreshCells у ag-grid
            const mockRefreshCells = vi.fn();
            vm.grid = {
                api: {
                    refreshCells: mockRefreshCells,
                },
            };

            vm.onRowGroupOpened!();

            expect(mockRefreshCells).toHaveBeenCalledWith({
                columns: ['num'],
            });
        });

        it('должен безопасно обрабатывать отсутствие api', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;

            // Устанавливаем grid без api
            vm.grid = {};

            // Не должно быть ошибок
            expect(() => vm.onRowGroupOpened!()).not.toThrow();
        });

        it('должен безопасно обрабатывать отсутствие grid', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const vm = wrapper.vm;

            // Устанавливаем grid как undefined
            vm.grid = undefined;

            // Не должно быть ошибок
            expect(() => vm.onRowGroupOpened!()).not.toThrow();
        });
    });

    describe('Рендеринг', () => {
        it('должен рендерить ag-grid-vue с пропсами', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const agGrid = wrapper.findComponent({ name: 'ag-grid-vue' });
            expect(agGrid.exists()).toBe(true);

            const props = agGrid.props();
            expect(props.treeData).toBeDefined();
            expect(props.getDataPath).toBeDefined();
            expect(props.columnDefs).toBeDefined();
            expect(props.autoGroupColumnDef).toBeDefined();
            expect(props.onRowGroupOpened).toBeDefined();
        });

        it('должен устанавливать высоту 500px', () => {
            const wrapper = mount(TreeWidget, {
                props: {
                    treeData: mockTreeData,
                },
            });

            const agGrid = wrapper.findComponent({ name: 'ag-grid-vue' });
            expect(agGrid.vm.style).toHaveProperty('height', '500px');
        });
    });
});
