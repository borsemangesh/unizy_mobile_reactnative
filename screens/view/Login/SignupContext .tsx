import React, { createContext, useState, ReactNode } from 'react';

export interface SignupData {
  firstName: string;
  lastName: string;
  username: string; // personal email
  password: string;
  universityEmail: string;
  profileData: Record<string, any>; // can refine later
}

// Context type
interface SignupContextType {
  signupData: SignupData;
  setSignupData: React.Dispatch<React.SetStateAction<SignupData>>;
}

// Default values
const defaultSignupData: SignupData = {
  firstName: '',
  lastName: '',
  username: '',
  password: '',
  universityEmail: '',
  profileData: {},
};

// Create context
export const SignupContext = createContext<SignupContextType>({
  signupData: defaultSignupData,
  setSignupData: () => {},
});

// Provider component
export const SignupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [signupData, setSignupData] = useState<SignupData>(defaultSignupData);

  return (
    <SignupContext.Provider value={{ signupData, setSignupData }}>
      {children}
    </SignupContext.Provider>
  );
};