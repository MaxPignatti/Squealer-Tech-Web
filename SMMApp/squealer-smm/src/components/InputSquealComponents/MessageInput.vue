<template>
	<textarea
		class="form-textarea w-full p-2 border rounded"
		:value="message"
		@input="onInput"
		@select="$emit('textSelect', $event)"
		:aria-label="`Inserisci il tuo messaggio. Caratteri rimanenti: ${calculatedRemainingCharacters}`"
		placeholder="Inserisci il tuo messaggio..."
	></textarea>
</template>

<script>
export default {
	props: {
		message: String,
		dailyCharactersLimit: Number,
		weeklyCharactersLimit: Number,
		monthlyCharactersLimit: Number,
		imageAttached: Boolean,
	},
	computed: {
		calculatedRemainingCharacters() {
			const additionalChars = this.imageAttached ? 50 : 0;
			return (
				this.dailyCharactersLimit - (this.message.length + additionalChars)
			);
		},
	},
	methods: {
		onInput(event) {
			const newMessage = event.target.value;
			if (this.isWithinCharacterLimits(newMessage)) {
				this.$emit("messageChange", newMessage);
			} else {
				// Forza l'aggiornamento del textarea con il valore corrente di 'message'
				event.target.value = this.message;
			}
		},
		isWithinCharacterLimits(newMessage) {
			const additionalChars = this.imageAttached ? 50 : 0;
			const totalChars = newMessage.length + additionalChars;
			return (
				totalChars <= this.dailyCharactersLimit &&
				totalChars <= this.weeklyCharactersLimit &&
				totalChars <= this.monthlyCharactersLimit
			);
		},
	},
};
</script>
