import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import nbaLogo from "../assets/National_Board_of_Accreditation.svg.png";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const { googleLogin, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
      return;
    }

    // Load Google Sign-In script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      /* global google */
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          {
            theme: "outline",
            size: "large",
            width: 320,
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "center",
          },
        );
      }
    };

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://accounts.google.com/gsi/client"]',
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [isAuthenticated, isLoading, navigate]);

  const handleGoogleResponse = async (response) => {
    if (response.credential) {
      const result = await googleLogin(response.credential);
      if (result.success) {
        navigate("/dashboard");
      } else {
        alert("Login failed: " + (result.error || "Unknown error"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="login-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="brand-title">BIT NBA</h1>
          <p className="brand-subtitle">Where Quality Meets Opportunity!</p>
        </div>
        
        <div className="login-content">
          <h2 className="welcome-text">Welcome back!</h2>
          
          <div className="login-icon">
            <img src={nbaLogo} alt="Logo" className="login-logo" />
          </div>
          
          <div className="google-btn-wrapper">
            <div id="google-signin-button"></div>
          </div>
          
          <p className="login-footer">Login in with bitsathy mail id.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
