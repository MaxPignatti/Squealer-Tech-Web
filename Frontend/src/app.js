import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './login';
import Registration from './registration';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
      </Routes>
    </div>
  );
}

export default App;
