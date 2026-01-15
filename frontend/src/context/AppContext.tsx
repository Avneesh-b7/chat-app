import { createContext, useContext, useState, type ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*                                Types                                       */
/* -------------------------------------------------------------------------- */

type AppContextType = {
  user: string | null;
  setUser: (user: string | null) => void;
};

/* -------------------------------------------------------------------------- */
/*                              Context                                       */
/* -------------------------------------------------------------------------- */

// Use `undefined` to detect misuse outside provider
const AppContext = createContext<AppContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                              Provider                                      */
/* -------------------------------------------------------------------------- */

type AppProviderProps = {
  children: ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<string | null>(null);

  const value: AppContextType = {
    user,
    setUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*                              Hook                                          */
/* -------------------------------------------------------------------------- */

export function useAppContext() {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
