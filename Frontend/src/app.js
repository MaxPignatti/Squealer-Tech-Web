import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './AuthContext'; 
import Login from './login';
import Registration from './registration';
import Home from './home_components/home';
import Profile from './home_components/Profile';
import AutoLogin from './AutoLogin';


function App() {

  return (
    <AuthProvider>
      <AutoLogin /> {}
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/" element={<Home />} />
          <Route path="/Profile" element={<Home/>} />
          
      </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
