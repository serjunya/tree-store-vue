<script setup lang="ts">
import TreeWidget from '@/widgets/Tree/ui/TreeWidget.vue';
import { testItems } from '@/shared/testItems';
</script>

<template>
    <tree-widget :tree-data="testItems" />
</template>
