import { ref } from 'vue';

export default function useAuth() {
  const isAuthenticated = ref(false);

  const login = () => {
    isAuthenticated.value = true;
  };

  const logout = () => {
    isAuthenticated.value = false;
  };

  return { isAuthenticated, login, logout };
}
