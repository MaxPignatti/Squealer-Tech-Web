import { onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Cookies from 'js-cookie';

export default function useAutoLogin() {
  const store = useStore();
  const router = useRouter();

  onMounted(async () => {
    const userDataCookie = Cookies.get('user_data');
    if (userDataCookie) {
      const userData = JSON.parse(decodeURIComponent(userDataCookie));
      const existingToken = userData.access_token;

      try {
        const response = await fetch('http://localhost:3500/protectedEndpoint', {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${existingToken}`,
          },
        });

        if (response.status === 200) {
          // Rinnova il cookie per altre 24 ore
          Cookies.set('user_data', userDataCookie, { expires: 1 });

          store.dispatch('login', userData); // Aggiorna lo stato di autenticazione
          router.push('/');
        } else {
          console.error('Authentication failed');
          // Opzionalmente, rimuovi il cookie se l'autenticazione fallisce
          Cookies.remove('user_data');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        Cookies.remove('user_data');
      }
    }
  });
}
