<template>
	<div class="flex">
		<div
			class="input-squeal-container"
			role="form"
			aria-labelledby="form-heading"
		>
			<RecipientSelector
				:searchTerm="searchTerm"
				@update:searchTerm="searchTerm = $event"
				:filteredChannels="filteredChannels"
				:selectedChannels="selectedChannels"
				@channelSelect="handleChannelSelect"
				@removeChannel="handleRemoveChannel"
			/>
			<div class="flex flex-wrap message-input-row">
				<div class="flex-1 min-w-0">
					<MessageInput
						:message="message"
						:dailyCharactersLimit="initialDailyCharacters"
						:weeklyCharactersLimit="initialWeeklyCharacters"
						:monthlyCharactersLimit="initialMonthlyCharacters"
						:imageAttached="image != null"
						@messageChange="handleMessageChange"
						@textSelect="handleTextSelect"
					/>
				</div>
				<div class="flex-none px-2">
					<LinkInserter @insertLink="handleInsertLink" />
				</div>
			</div>

			<div class="flex justify-between items-center mt-4">
				<ImageUploader
					:image="image"
					:imagePreview="imagePreview"
					@imageChange="handleImageChange"
					@removeImage="handleRemoveImage"
				/>
				<TemporaryMessageOptions
					:isTemp="isTemp"
					@toggleTemp="toggleTemp"
					:updateInterval="updateInterval"
					@updateIntervalChange="handleUpdateIntervalChange"
					:maxSendCount="maxSendCount"
					@maxSendCountChange="handleMaxSendCountChange"
				/>
			</div>

			<div class="mt-4 md:mb-0 md:w-1/3">
				<MapLocationPicker
					:location="location"
					@locationChange="handleLocationChange"
				/>
			</div>

			<div class="flex flex-wrap mt-4">
				<div class="flex-1 min-w-0">
					<CharCounter
						:dailyCharacters="dailyCharacters"
						:weeklyCharacters="weeklyCharacters"
						:monthlyCharacters="monthlyCharacters"
					/>
				</div>

				<div class="flex-1 flex flex-col justify-end">
					<button
						class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded self-end"
						@click="handlePublish"
						aria-label="Pubblica messaggio"
					>
						Pubblica
					</button>
				</div>
			</div>
			<div
				v-if="errorMessage"
				role="alert"
				style="color: red"
			>
				{{ errorMessage }}
			</div>
		</div>
	</div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Cookies from "js-cookie";
import CharCounter from "./CharCounter.vue";
import ImageUploader from "./ImageUploader.vue";
import LinkInserter from "./LinkInserter.vue";
import MessageInput from "./MessageInput.vue";
import RecipientSelector from "./RecipientSelector.vue";
import TemporaryMessageOptions from "./TemporaryMessageOptions.vue";
import MapLocationPicker from "./MapLocationPicker.vue";
import { BASE_URL } from "../../config";

export default {
	components: {
		CharCounter,
		RecipientSelector,
		ImageUploader,
		LinkInserter,
		MessageInput,
		TemporaryMessageOptions,
		MapLocationPicker,
	},
	setup() {
		const message = ref("");

		const dailyCharacters = ref(0);
		const weeklyCharacters = ref(0);
		const monthlyCharacters = ref(0);
		const initialDailyCharacters = ref(0);
		const initialWeeklyCharacters = ref(0);
		const initialMonthlyCharacters = ref(0);

		const errorMessage = ref("");

		const selection = ref({ start: 0, end: 0 });

		const isTemp = ref(false);
		const updateInterval = ref(0);
		const maxSendCount = ref(0);

		const filteredChannels = ref([]);
		const searchTerm = ref("");
		const channels = ref([]);
		const selectedChannels = ref([]);

		const image = ref(null);
		const imagePreview = ref(null);

		const vipUsername = ref(null);

		const location = ref(null);

		// Definisci le funzioni di gestione degli eventi
		const handleLocationChange = (newLocation) => {
			if (
				(dailyCharacters.value < 125 ||
					weeklyCharacters.value < 125 ||
					monthlyCharacters.value < 125) &&
				!location.value
			) {
				alert("Not enough characters for a position upload.");
			} else {
				location.value = newLocation;
			}
		};

		onMounted(() => {
			const authToken = Cookies.get("authToken");
			if (authToken) {
				fetch(`${BASE_URL}/smm/session`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				})
					.then((response) => response.json())
					.then((data) => {
						vipUsername.value = data.vip;

						return fetch(
							`${BASE_URL}/users/${vipUsername.value}/subscribedChannels`
						);
					})
					.then((response) => response.json())
					.then((data) => {
						const nonModeratorChannels = data.filter(
							(channel) => !channel.moderatorChannel
						);
						channels.value = nonModeratorChannels;

						return fetch(`${BASE_URL}/usr/${vipUsername.value}`);
					})
					.then((response) => {
						if (response.status === 200) {
							return response.json();
						} else {
							throw new Error("API call failed");
						}
					})
					.then((data) => {
						dailyCharacters.value = data.dailyChars;
						weeklyCharacters.value = data.weeklyChars;
						monthlyCharacters.value = data.monthlyChars;
						initialDailyCharacters.value = data.dailyChars;
						initialWeeklyCharacters.value = data.weeklyChars;
						initialMonthlyCharacters.value = data.monthlyChars;
					})
					.catch((error) => {
						console.error("API call error:", error);
					});
			} else {
				console.error("User data not found in cookies");
			}
		});

		watch([searchTerm, channels], () => {
			filteredChannels.value = channels.value
				.filter((channel) =>
					channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
				)
				.slice(0, 5);
		});

		watch([image, location], () => {
			const charCounter =
				(image.value != null ? 125 : 0) +
				(location.value != null ? 125 : 0) +
				message.value.length;

			dailyCharacters.value = initialDailyCharacters.value - charCounter;
			weeklyCharacters.value = initialWeeklyCharacters.value - charCounter;
			monthlyCharacters.value = initialMonthlyCharacters.value - charCounter;
		});

		//FUNZIONI PER DESTINATARI
		watch([searchTerm], () => {
			filteredChannels.value = channels.value.filter((channel) =>
				channel.name.toLowerCase().includes(searchTerm.value.toLowerCase())
			);
		});

		const handleChannelSelect = (newChannel) => {
			if (
				!selectedChannels.value.some(
					(channel) => channel._id === newChannel._id
				)
			) {
				selectedChannels.value.push(newChannel);
			}
		};

		const handleRemoveChannel = (channelId) => {
			selectedChannels.value = selectedChannels.value.filter(
				(channel) => channel._id !== channelId
			);
		};

		//FUNZIONI PER MESSAGGIO
		const handleMessageChange = (newMessage) => {
			message.value = newMessage;
			const charCounter =
				(image.value != null ? 125 : 0) +
				(location.value != null ? 125 : 0) +
				message.value.length;

			dailyCharacters.value = initialDailyCharacters.value - charCounter;
			weeklyCharacters.value = initialWeeklyCharacters.value - charCounter;
			monthlyCharacters.value = initialMonthlyCharacters.value - charCounter;
		};

		//FUNZIONI PER IMMAGINI
		const handleImageChange = (event) => {
			if (
				dailyCharacters.value < 125 ||
				weeklyCharacters.value < 125 ||
				monthlyCharacters.value < 125
			) {
				alert("Not enough characters for an image upload.");
				return;
			}

			const file = event.target.files?.[0];
			if (file) {
				if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
					alert("Please select a JPEG or PNG image.");
					return;
				}
				const reader = new FileReader();
				reader.onload = (e) => {
					image.value = e.target.result;
					imagePreview.value = e.target.result;
				};
				reader.readAsDataURL(file);
			}
		};

		const handleRemoveImage = () => {
			image.value = null;
			imagePreview.value = null;
		};

		//FUNZIONI PER LINK
		const handleTextSelect = (event) => {
			selection.value = {
				start: event.target.selectionStart,
				end: event.target.selectionEnd,
			};
		};

		const handleInsertLink = (url) => {
			if (url && selection.value.start !== selection.value.end) {
				const beforeText = message.value.substring(0, selection.value.start);
				const linkText = message.value.substring(
					selection.value.start,
					selection.value.end
				);
				const afterText = message.value.substring(selection.value.end);
				message.value = `${beforeText}[${linkText}](${url})${afterText}`;
			} else {
				alert("Per favore, seleziona il testo a cui vuoi attribuire un link.");
			}
		};

		//FUNZIONI PER MESSAGGI TEMPORANEI
		const toggleTemp = () => {
			isTemp.value = !isTemp.value;
			if (!isTemp.value) {
				updateInterval.value = "";
				maxSendCount.value = "";
			}
		};

		const handleUpdateIntervalChange = (newInterval) => {
			updateInterval.value = Number(newInterval) || 0;
		};

		const handleMaxSendCountChange = (newMaxSendCount) => {
			maxSendCount.value = Number(newMaxSendCount) || 0;
		};

		//PUBLISH
		const validateMessageAndChannels = () => {
			const savedMessage = message.value;
			const channelsLength = selectedChannels.value.length;

			if (!savedMessage) {
				errorMessage.value = "Scrivi qualcosa";
				return false;
			} else if (channelsLength === 0) {
				errorMessage.value = "Seleziona un destinatario";
				return false;
			}

			return true;
		};

		const prepareRequestData = () => {
			const savedMessage = message.value;
			const savedImage = image.value;
			const isTempMessage = updateInterval.value && maxSendCount.value;
			const currentTime = new Date();
			return {
				userName: vipUsername.value,
				image: savedImage,
				text: savedMessage,
				dailyCharacters: dailyCharacters.value,
				weeklyCharacters: weeklyCharacters.value,
				monthlyCharacters: monthlyCharacters.value,
				updateInterval: isTempMessage ? updateInterval.value : undefined,
				maxSendCount: isTempMessage ? maxSendCount.value : undefined,
				nextSendTime: isTempMessage
					? new Date(currentTime.getTime() + updateInterval.value * 60000)
					: undefined,
				location: location.value
					? [location.value[1], location.value[0]]
					: null,
				recipients: {
					channels: selectedChannels.value.map((channel) => channel.name),
					users: [],
				},
			};
		};

		const handlePublishRequest = async () => {
			try {
				const requestData = prepareRequestData();
				const url = `${BASE_URL}/messages`;
				const requestOptions = {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(requestData),
				};

				const response = await fetch(url, requestOptions);

				if (response.status === 201) {
					window.location.reload();
				} else {
					const data = await response.json();
					console.error("Errore nella creazione del messaggio:", data.error);
				}
			} catch (error) {
				console.error("Errore nella creazione del messaggio:", error);
			}
		};

		const handlePublish = async () => {
			if (validateMessageAndChannels()) {
				errorMessage.value = "";
				if (vipUsername.value) {
					await handlePublishRequest();
				}
			}
		};

		return {
			message,
			dailyCharacters,
			weeklyCharacters,
			monthlyCharacters,
			initialDailyCharacters,
			initialWeeklyCharacters,
			initialMonthlyCharacters,
			errorMessage,
			isTemp,
			updateInterval,
			maxSendCount,
			filteredChannels,
			searchTerm,
			channels,
			selectedChannels,
			location,
			image,
			imagePreview,

			handleChannelSelect,
			handleRemoveChannel,
			handleMessageChange,
			handleImageChange,
			handleRemoveImage,
			handleTextSelect,
			handleInsertLink,
			toggleTemp,
			handleLocationChange,
			handleUpdateIntervalChange,
			handleMaxSendCountChange,
			handlePublish,
		};
	},
};
</script>

<style>
.input-squeal-container {
	width: 100%;
	margin: 1rem;
	padding: 2rem;
	box-shadow: 0 8px 16px rgba(0, 128, 0, 0.4);
	color: #333;
	background-color: #fff;
}

.flex.flex-wrap {
	gap: 1rem;
}

@media (max-width: 768px) {
	.input-squeal-container .flex-1 {
		flex-basis: 100%;
	}

	.input-squeal-container .flex-none {
		flex-basis: 100%;
	}
	.input-squeal-container .flex.justify-between {
		gap: 1rem;
	}
}

.input-squeal-container .message-input-row {
	margin-top: 0.5rem;
}
</style>
