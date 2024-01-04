import { onMounted } from 'vue';
import useAuth from './useAuth';
import { useRouter } from 'vue-router';

export default function useAutoLogin() {
  const { login } = useAuth();
  const router = useRouter();

  onMounted(async () => {
    const userDataCookie = getCookie('user_data');
    console.log(userDataCookie)
    if (userDataCookie) {
      const userData = JSON.parse(decodeURIComponent(userDataCookie));
      console.log(userData);
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
          login();
          router.push('/');
        } else {
          console.error('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication failed:', error);
      }
    }
  });

  // Helper function to get a cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}
