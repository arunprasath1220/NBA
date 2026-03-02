import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const GOOGLE_CLIENT_ID =
  "375289431515-nlhqdrj9pf71pbns2203or4iurmhfk3f.apps.googleusercontent.com";

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
            width: 300,
            text: "signin_with",
            shape: "rectangular",
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
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to NBA</h1>
        <p>Sign in to continue</p>
        <div id="google-signin-button"></div>
      </div>
    </div>
  );
};

export default Login;
