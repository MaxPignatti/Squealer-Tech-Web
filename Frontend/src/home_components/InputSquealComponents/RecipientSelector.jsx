const RecipientSelector = ({ recipientType, handleRecipientChange, searchTerm, handleSearchChange, filteredChannels, filteredUsers, handleRecipientSelect }) => {
    return (
    <div>
      <div className="mb-2">
        <label>
          <input
            type="radio"
            name="recipientType"
            value="user"
            checked={recipientType === 'user'}
            onChange={() => handleRecipientChange('user')}
          /> Utente Singolo
        </label>
        <label className="ml-2">
          <input
            type="radio"
            name="recipientType"
            value="channel"
            checked={recipientType === 'channel'}
            onChange={() => handleRecipientChange('channel')}
          /> Canale
        </label>
      </div>
        {/* Input e selezione del tipo di destinatario (utente o canale) */}
        <input
          type="text"
          className="form-control mb-2"
          placeholder={recipientType === 'user' ? "Cerca utente..." : "Cerca canale..."}
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <ul className="list-unstyled">
          {recipientType === 'user' && filteredUsers.map(user => (
            <li key={user.id} className="mb-1">
              <button className="btn btn-secondary btn-sm mr-1" onClick={() => handleRecipientSelect(user)}>
                {user.name}
              </button>
            </li>
          ))}
          {recipientType === 'channel' && filteredChannels.map(channel => (
            <li key={channel.id} className="mb-1">
              <button className="btn btn-secondary btn-sm mr-1" onClick={() => handleRecipientSelect(channel)}>
                {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default RecipientSelector;
  