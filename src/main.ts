import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import vuetify from './plugins/vuetify';
import '@/assets/styles/variables.scss';
import '@/assets/styles/overrides.scss';

import piniaPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPersistedstate);
app.use(pinia);
app.use(router);
app.use(vuetify);
app.mount('#app');
