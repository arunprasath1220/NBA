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
      navigate("/institute-profile");
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
        navigate("/institute-profile");
      } else {
        alert("Login failed: " + (result.error || "Unknown error"));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full fixed top-0 left-0 bg-[#f9fafb]">
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full fixed top-0 left-0 bg-[#f9fafb]">
      <div className="bg-white pt-10 px-12 pb-8 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-center max-w-[420px] w-full">
        <div className="mb-6">
          <h1 className="text-[#0095ff] text-[1.75rem] font-bold italic tracking-wide mb-1">BIT NBA</h1>
          <p className="text-gray-500 text-[0.9rem] font-normal">Where Quality Meets Opportunity!</p>
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="text-gray-800 text-2xl font-semibold mb-5">Welcome back!</h2>
          
          <div className="mb-6">
            <img src={nbaLogo} alt="Logo" className="w-20 h-auto" />
          </div>
          
          <div className="w-full mb-4 flex justify-center">
            <div id="google-signin-button"></div>
          </div>
          
          <p className="text-gray-400 text-[0.85rem] mt-2">Login in with bitsathy mail id.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
