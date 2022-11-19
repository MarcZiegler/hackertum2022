import { AuthType } from 'AuthTypes';
import React from 'react';

type AuthContextType = {auth: AuthType | null, setAuth: React.Dispatch<React.SetStateAction<AuthType | null>> | any}
const AuthContext = React.createContext<AuthContextType>({auth:null, setAuth:()=>null});

export function AuthContextProvider(props:any) {
    const [auth, setAuth] = React.useState<AuthType | null>(null)
  return (
    <AuthContext.Provider value={{auth:auth,setAuth:setAuth}}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => React.useContext(AuthContext);