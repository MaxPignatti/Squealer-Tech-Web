import InputSqueal from './InputSquealComponents/InputSqueal'; // Importa il componente InputSqueel
import Squeels from './Squeels'; // Importa il componente per visualizzare i messaggi
import React from "react";
import './Profile_style.css';

const MainPage = () => {
  return (
    <div className="main-page">
      <InputSqueal />
      <Squeels />
    </div>
  );
};

export default MainPage;