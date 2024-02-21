import React from "react";
import { Button } from "react-bootstrap";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      Cookies.remove("user_data");

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button variant="danger" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
