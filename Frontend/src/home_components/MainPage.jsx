import InputSqueel from './InputSqueel'; // Importa il componente InputSqueel
import Squeels from './Squeels'; // Importa il componente per visualizzare i messaggi
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, CardBody } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Cookies from 'js-cookie';
import { useAuth } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import './Profile_style.css';

const MainPage = () => {
  return (
    <div className="main-page">
      <InputSqueel />
      <Squeels />
    </div>
  );
};

export default MainPage;