import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './login';
import Registration from './registration';
import Home from './home';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
