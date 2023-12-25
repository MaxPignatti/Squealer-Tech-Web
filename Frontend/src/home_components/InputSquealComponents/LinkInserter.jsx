import React from 'react';

const LinkInserter = ({ handleInsertLink, selection }) => {
  const handleButtonClick = () => {
    const url = prompt("Inserisci l'URL del link:");
    handleInsertLink(url);
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Inserisci Link</button>
    </div>
  );
};

export default LinkInserter;
