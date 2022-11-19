import { Alert, Box, Button, Divider, Paper, Snackbar, Stack, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import _ from 'lodash';
import { useAuthContext } from './context/AuthContext';
import { SERVER_URL } from './FrontPage';
type LoginProps = {

}

const LOGIN_ENDPOINT = SERVER_URL + "/user"
/**
 * Login and register page
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const Login: React.FC<LoginProps> = (props) => {
    const {auth, setAuth} = useAuthContext();
    const theme = useTheme();
    const [onLogin, setOnLogin] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string|null>(null);

    const onSubmitHandler = () => {
        fetch(LOGIN_ENDPOINT, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                username: username,
                isRealUser: "true"
            })
        }).then((response) => {
            if (response.ok) {
                response.json().then((data) => {
                    console.log({
                        token: data.token, //uuid
                        username: data.username, //username
                        money: data.money, //money
                    })
                    setAuth({
                        token: data.token, //uuid
                        username: data.username, //username
                        money: data.money, //money
                    });
                })
            } else if (response.status == 500) {
                setError("Username taken");
            } else {
                setError("Error creating user");
            }
        })
    }
    
    return (
        <>
            <Paper elevation={2} sx={{ position:"fixed",bottom:"50%",left:"50%",transform: "translate(-50%, 50%)"}}>
            <Box sx={{width:"100%"}} textAlign='center'>
            <Button color='warning' size="small" onClick={()=>null} sx={{maxHeight:"10px", textTransform:"none", alignSelf:"center"}}>
                {onLogin?"Register here":"Login here (Coming soon) "}
            </Button>
            </Box>
            <Typography variant="h6" sx={{m:"10px"}}>{onLogin?"Login":"Register"}</Typography>
            <Stack direction="column" justifyContent='center' divider={<Divider flexItem />} sx={{marginY:"10px"}}>
                <TextField value={username} onChange={e=>setUsername(e.target.value)} variant="outlined" label={onLogin?"Username":"New Username"} sx={{margin:"10px"}}/>
                <TextField value={password} onChange={e=>setPassword(e.target.value)} type="password" variant="outlined" label={onLogin?"Password":"Set Password"} sx={{margin:"10px"}}/>
                <Button onClick={()=>onSubmitHandler()} sx={{mx:"10px"}}>
                    Submit
                </Button>
            </Stack>
            </Paper>
            <Snackbar open={error !== null} autoHideDuration={6000} onClose={()=>setError(null)}>
                <Alert onClose={()=>setError(null)} severity="error" sx={{ width: '100%' }}>
                {error}
                </Alert>
            </Snackbar>
        </>
    );

}

export default Login;