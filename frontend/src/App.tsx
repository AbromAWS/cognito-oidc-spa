import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { UserManager, User } from "oidc-client-ts";
import { oidcConfig } from "./authConfig";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrowNightBright } from "react-syntax-highlighter/dist/esm/styles/hljs";
import './App.css';

const userManager = new UserManager(oidcConfig);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    userManager.signinRedirect();
  };

  const logout = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;

    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;

    sessionStorage.clear();

    window.location.href = logoutUrl;
  };

  useEffect(() => {
    userManager.getUser().then((user) => {
      if (user) setUser(user);
    });
  }, []);

  const displayTokenData = () => {
    const idToken = sessionStorage.getItem("id_token");
    const accessToken = sessionStorage.getItem("access_token");

    return (
      <>
        <SyntaxHighlighter
          language="json"
          style={tomorrowNightBright}
          showLineNumbers={true}
          wrapLongLines={true}
          customStyle={{ textAlign: "left" }}
        >
          {JSON.stringify(parseJwt(idToken), null, 2)}
        </SyntaxHighlighter>
        <SyntaxHighlighter
          language="json"
          style={tomorrowNightBright}
          showLineNumbers={true}
          wrapLongLines={true}
          customStyle={{ textAlign: "left" }}
        >
          {JSON.stringify(parseJwt(accessToken), null, 2)}
        </SyntaxHighlighter>
      </>
    );
  };

  const parseJwt = (token: string | null) => {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} login={login} logout={logout} displayTokenData={displayTokenData} />} />
        <Route path="/callback" element={<Callback setUser={setUser} />} />
      </Routes>
    </Router>
  );
};

const Home: React.FC<{
  user: User | null;
  login: () => void;
  logout: () => void;
  displayTokenData: () => JSX.Element;
}> = ({ user, login, logout, displayTokenData }) => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {user ? (
        <>
          <h1>Hello, {user.profile.given_name || user.profile.email}!</h1>
          {displayTokenData()}
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <h1>Hello, Guest!</h1>
          <button onClick={login}>Login</button>
        </>
      )}
    </div>
  );
};

const Callback: React.FC<{ setUser: React.Dispatch<React.SetStateAction<User | null>> }> = ({ setUser }) => {
  const navigate = useNavigate();

  useEffect(() => {
    userManager.signinRedirectCallback()
      .then((user) => {
        setUser(user);
        sessionStorage.setItem("id_token", user.id_token || "");
        sessionStorage.setItem("access_token", user.access_token);
        sessionStorage.setItem("refresh_token", user.refresh_token ?? "");

        // Navigate back to the home page
        navigate("/");
      })
      .catch((error) => {
        console.error("Error during authentication:", error);
      });
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Processing...</h2>
      <img
        src="/loading.gif"
        alt="Loading"
        style={{ marginTop: "20px", width: "50px", height: "50px" }}
      />
    </div>
  );
};

export default App;
