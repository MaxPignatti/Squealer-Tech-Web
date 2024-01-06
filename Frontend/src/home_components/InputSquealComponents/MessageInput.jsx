const MessageInput = ({ message, handleMessageChange, handleTextSelect }) => {
  return (
    <textarea
      value={message}
      onChange={handleMessageChange}
      onSelect={handleTextSelect}
      placeholder="Inserisci il tuo messaggio..."
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        height: "100px",
      }}
    />
  );
};

export default MessageInput;
