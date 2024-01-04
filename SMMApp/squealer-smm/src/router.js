import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/LoginComponent.vue';
import Register from './components/RegisterComponent.vue';

const routes = [
  { path: '/', redirect: '/login' }, // Reindirizzamento dalla homepage al login
  { path: '/login', component: Login },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
