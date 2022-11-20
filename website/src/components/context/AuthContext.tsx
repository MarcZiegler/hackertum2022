import { AuthType } from 'AuthTypes';
import React from 'react';
import Login, { LOCAL_STORAGE_AUTH_KEY } from '../Login';

type AuthContextType = {auth: AuthType | null, setAuth: React.Dispatch<React.SetStateAction<AuthType | null>>|null}
const AuthContext = React.createContext<AuthContextType>({auth:null, setAuth:null});

export function AuthContextProvider(props:any) {
    const jsonAuth = window.localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
    const [auth, setAuth] = React.useState<AuthType | null>(jsonAuth !== null ? JSON.parse(jsonAuth) : null);
    //console.log(auth)
  return (
    <AuthContext.Provider value={{auth:auth,setAuth:setAuth}}>
        {auth === null ? <Login/> :
        props.children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => React.useContext(AuthContext);