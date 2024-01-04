import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/LoginComponent.vue';

const routes = [
  { path: '/', redirect: '/login' }, // Reindirizzamento dalla homepage al login
  { path: '/login', component: Login },
  // Aggiungi altre rotte qui
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
