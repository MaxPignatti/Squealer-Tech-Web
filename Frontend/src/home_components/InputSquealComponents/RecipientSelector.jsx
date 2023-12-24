const RecipientSelector = ({ recipientType, handleRecipientChange, searchTerm, handleSearchChange, filteredChannels, filteredUsers, handleUserSelect, handleChannelSelect, selectedUsers, selectedChannels, handleRemoveUser, handleRemoveChannel }) => {
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
        onChange={() => handleRecipientChange('channel')} /> Canale
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
            <li key={user._id} className="mb-1">
              <button className="btn btn-secondary btn-sm mr-1" onClick={() => handleUserSelect(user)}>
                {user.username}
              </button>
            </li>
          ))}
          {recipientType === 'channel' && filteredChannels.map(channel => (
            <li key={channel._id} className="mb-1">
              <button className="btn btn-secondary btn-sm mr-1" onClick={() => handleChannelSelect(channel)}>
                {channel.name}
              </button>
            </li>
          ))}
        </ul>
      <div>
        <h5>Utenti Selezionati:</h5>
        <div className="d-flex flex-wrap">
          {selectedUsers.map(user => (
            <div key={user._id}>
              {user.username}
              <button className="btn btn-danger btn-sm ml-2" onClick={() => handleRemoveUser(user._id)}>X</button>
            </div>
          ))}
        </div>

        <h5>Canali Selezionati:</h5>
        <div className="d-flex flex-wrap">
          {selectedChannels.map(channel => (
            <div key={channel._id}>
              {channel.name}
              <button className="btn btn-danger btn-sm ml-2" onClick={() => handleRemoveChannel(channel._id)}>X</button>
            </div>
          ))}
        </div>
      </div>
      </div>
    );
  };
  
  export default RecipientSelector;
  