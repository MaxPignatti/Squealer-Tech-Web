import { createRouter, createWebHistory } from 'vue-router';
import Login from './components/LoginComponent.vue';
import Register from './components/RegisterComponent.vue';
import Home from './components/HomeComponent.vue'

const routes = [
  { path: '/', component: Home }, 
  { path: '/login', component: Login },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
