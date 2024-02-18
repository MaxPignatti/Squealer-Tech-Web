<template>
	<div>
		<header>
			<nav
				class="bg-gray-800 text-white p-4"
				aria-label="Navigazione principale"
			>
				<div class="container mx-auto flex justify-between items-center">
					<div>
						<a
							href="/"
							class="text-xl font-bold"
							>SMM Squealer</a
						>
					</div>
					<div class="flex items-center">
						<span class="mr-4">VIP: {{ vipName }}</span>
						<button
							@click="logout"
							class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-2"
							aria-label="Logout"
						>
							Logout
						</button>
					</div>
				</div>
			</nav>
		</header>
		<main
			class="container mx-auto py-4 text-left"
			role="main"
		>
			<div class="ml-4">
				<button
					@click="toggleInputSqueal"
					:class="buttonClass"
					class="font-bold py-2 px-4 rounded mb-2 transition-all duration-200 flex items-center"
					aria-expanded="showInputSqueal.toString()"
				>
					{{ showInputSqueal ? "Annulla" : "Nuovo Squeal" }}
					<span class="ml-2">{{ showInputSqueal ? "▲" : "▼" }}</span>
				</button>
			</div>

			<section
				v-if="showInputSqueal"
				class="input-squeal-wrapper mb-4"
			>
				<InputSqueal ref="inputSquealComponent" />
			</section>
			<div class="Squeals-container">
				<Squeals />
			</div>
		</main>
	</div>
</template>

<script>
import InputSqueal from "./InputSquealComponents/InputSqueal.vue";
import Squeals from "./SquealsComponent.vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { ref, watch, computed, nextTick } from "vue";
import Cookies from "js-cookie";

export default {
	components: {
		InputSqueal,
		Squeals,
	},
	setup() {
		const store = useStore();
		const router = useRouter();
		const vipName = ref(store.state.vip);
		const showInputSqueal = ref(false);
		const inputSquealComponent = ref(null);

		// Aggiorna il ref vipName quando lo stato del VIP in Vuex cambia
		watch(
			() => store.state.vip,
			(newVipName) => {
				vipName.value = newVipName;
			}
		);

		const logout = () => {
			Cookies.remove("authToken");
			store.dispatch("logout");
			router.push("/login");
		};

		const toggleInputSqueal = () => {
			showInputSqueal.value = !showInputSqueal.value;
			if (showInputSqueal.value) {
				nextTick(() => {
					if (inputSquealComponent.value) {
						inputSquealComponent.value.focus();
					}
				});
			}
		};

		return {
			logout,
			vipName,
			showInputSqueal,
			toggleInputSqueal,
			buttonClass: computed(() => ({
				"bg-green-500 hover:bg-green-700 text-white": !showInputSqueal.value,
				"bg-white text-green-500 border border-green-500 hover:bg-green-500 hover:text-white":
					showInputSqueal.value,
			})),
		};
	},
};
</script>

<style>
nav {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	z-index: 1000;
}

.container.mx-auto.py-4 {
	padding-top: 6rem;
}

.input-squeal-wrapper {
	margin-left: 1rem;
}
.Squeals-container {
	padding-top: 2rem;
}
</style>
