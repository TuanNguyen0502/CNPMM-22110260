import { createContext, useState } from "react";

// Create Auth Context
export const AuthContext = createContext({
  isAuthenticated: false,
  user: {
    email: "",
    name: "",
  },
  appLoading: true,
});

// Auth Context Provider Wrapper
export const AuthWrapper = (props) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: {
      email: "",
      name: "",
    },
  });

  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        appLoading,
        setAppLoading,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
