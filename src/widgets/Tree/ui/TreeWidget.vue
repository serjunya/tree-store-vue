<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3';
import type { AutoGroupColumnDef, RowNumbersOptions, ValueGetterParams } from 'ag-grid-enterprise';
import type { Item } from '../types/Item';
import { TreeStore } from '../model/tree-store';
import { ref } from 'vue';

const props = defineProps<{
    treeData: Item[];
}>();

const treeStore = new TreeStore(props.treeData);

const getDataPath = (item: Item) =>
    [...treeStore.getAllParents(item.id).reverse(), item.id] as string[];

const autoGroupColumnDef: AutoGroupColumnDef = {
    headerName: 'Категория',
    width: 300,
    valueGetter: (params: ValueGetterParams<Item>) =>
        treeStore.getChildren(params.data!.id).length ? 'Группа' : 'Элемент',
    cellRendererParams: {
        suppressCount: true,
    },
};

const columnDefs = [
    {
        headerName: '№ п\\п',
        colId: 'num',
        lockPosition: 'left' as const,
        valueGetter: (params: ValueGetterParams<Item>) =>
            params.node?.rowIndex != null ? params.node.rowIndex + 1 : '',
        width: 80,
    } as RowNumbersOptions,
    { headerName: 'Наименование', field: 'label' },
];

const grid = ref();

const onRowGroupOpened = () => {
    grid.value?.api?.refreshCells({
        columns: ['num'],
    });
};
</script>

<template>
    <ag-grid-vue
        ref="grid"
        tree-data
        :row-data="treeStore.getAll()"
        :get-data-path
        :column-defs
        :auto-group-column-def
        :on-row-group-opened
        style="height: 500px"
    />
</template>

<style lang="scss">
$level-indent: 15px;

@mixin font-medium {
    font-weight: 500;
}

.ag {
    &-header-cell-resize:after {
        height: 100%;
        top: 0;
    }
    &-row {
        &:not(.ag-row-level-0) {
            .ag {
                &-cell-wrapper:not(.ag-row-group-leaf-indent) {
                    margin-left: $level-indent;
                }
                &-icon {
                    position: absolute;
                    left: $level-indent;
                }
            }
        }
        &-group {
            @include font-medium;
        }
    }
    &-column-first {
        @include font-medium;
    }
}
</style>
