import { createRouter, createWebHistory } from 'vue-router';
import store from './store';
import Login from './components/LoginComponent.vue';
import Register from './components/RegisterComponent.vue';
import Home from './components/HomeComponent.vue';

const routes = [
  { path: '/', component: Home }, 
  { path: '/login', component: Login },
  { path: '/register', component: Register },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.isAuthenticated; 

  if (!isAuthenticated && to.path !== '/login' && to.path !== '/register') {
    next('/login');
  } else {
    next();
  }
});

export default router;
