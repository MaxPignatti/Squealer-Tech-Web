<template>
	<div
		class="bg-white shadow-md rounded-lg p-4 border border-blue-200"
		role="article"
		aria-labelledby="message-title"
	>
		<h2
			id="message-title"
			class="sr-only"
		>
			Messaggio di {{ message.user }}
		</h2>
		<div class="flex items-center mb-2">
			<img
				v-if="message.profileImage"
				:src="message.profileImage"
				alt="Foto profilo"
				class="h-10 w-10 rounded-full mr-2"
			/>
			<span class="font-bold">{{ message.user }}</span>
		</div>
		<p class="text-left border-l-4 border-blue-500 pl-2">
			“{{ message.text }}”
		</p>
		<img
			v-if="message.image"
			:src="message.image"
			alt="Immagine del messaggio"
			class="my-2 mx-auto"
		/>

		<div
			v-if="message.location"
			class="my-2"
		>
			<iframe
				:src="mapSrc"
				width="100%"
				height="250"
				title="Posizione"
				style="border: 0"
			></iframe>
		</div>

		<div class="flex justify-between items-center my-2">
			<div class="flex items-center">
				<span class="mr-2">👍 {{ message.positiveReactions }}</span>
				<span>👎 {{ message.negativeReactions }}</span>
			</div>
		</div>

		<div class="flex justify-between items-center">
			<button
				ref="toggleButton"
				@click="toggleReplies"
				class="toggle-reply-button"
			>
				{{ showReplies ? "Nascondi risposte" : "Vedi Risposte" }}
			</button>
			<p class="text-sm text-gray-500 italic">
				{{ formatDate(message.createdAt) }}
			</p>
		</div>

		<div v-if="showReplies">
			<div
				v-for="reply in replies"
				:key="reply._id"
			>
				<MessageComponent :message="reply" />
			</div>
			<div v-if="replies.length === 0">Nessuna risposta.</div>
		</div>
	</div>
</template>

<script>
import { BASE_URL } from "../config";

export default {
	props: {
		message: Object,
	},
	computed: {
		mapSrc() {
			const [lat, lng] = this.message.location;
			return `https://www.openstreetmap.org/export/embed.html?bbox=${
				lng - 0.005
			}%2C${lat - 0.005}%2C${lng + 0.005}%2C${
				lat + 0.005
			}&layer=mapnik&marker=${lat}%2C${lng}`;
		},
	},
	data() {
		return {
			replies: [],
			showReplies: false,
		};
	},
	methods: {
		loadReplies() {
			fetch(`${BASE_URL}/messages/${this.message._id}/replies`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((data) => {
					this.replies = data;
				})
				.catch((error) => {
					console.error("Errore durante il recupero delle risposte:", error);
				});
		},
		toggleReplies() {
			this.showReplies = !this.showReplies;
			if (this.showReplies && this.replies.length === 0) {
				this.loadReplies();
			}
			this.$nextTick(() => {
				if (this.$refs.toggleButton) {
					this.$refs.toggleButton.setAttribute(
						"aria-expanded",
						this.showReplies
					);
				}
			});
		},
		formatDate(dateString) {
			const options = {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			};
			return new Date(dateString).toLocaleDateString("it-IT", options);
		},
	},
};
</script>

<style>
.toggle-reply-button {
	color: blue; /* Imposta il colore del testo */
}

iframe {
	overflow: hidden;
	border: none;
}
</style>
