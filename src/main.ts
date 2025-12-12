import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './app/App.vue';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

const app = createApp(App);

app.use(createPinia());

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule]);

app.mount('#app');
