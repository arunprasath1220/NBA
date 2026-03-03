import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🚫</div>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <button onClick={handleGoBack} className="back-button">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
