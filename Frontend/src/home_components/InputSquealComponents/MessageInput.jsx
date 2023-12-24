const MessageInput = ({ message, handleMessageChange }) => (
    <textarea
      className="form-control mb-2"
      value={message}
      onChange={handleMessageChange}
      placeholder="Inserisci il tuo messaggio..."
      rows="4"
    />
  );

export default MessageInput;