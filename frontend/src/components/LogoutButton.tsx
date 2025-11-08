import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { setToken } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl text-white font-medium shadow-md hover:scale-105 active:scale-95"
    >
      🔓 Se déconnecter
    </button>
  );
};

export default LogoutButton;
