import { Alert, Avatar, Box, Button, Divider, Paper, Snackbar, Stack, TextField, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';
import _ from 'lodash';
import { useAuthContext } from './context/AuthContext';
import { SERVER_URL } from './enums/Constants';
import { AuthType } from 'AuthTypes';
type TraderProps = {

}

const TRADERS_ENDPOINT = SERVER_URL + "/user/traders"
/**
 * Traders view
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const Traders: React.FC<TraderProps> = (props) => {
    const {auth, setAuth} = useAuthContext();
    const theme = useTheme();
    const [traders, setTraders] = useState<TraderType[] | null>(null);
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = () => {
        setLoading(true);
        fetch(TRADERS_ENDPOINT).then((response) => {
            setLoading(false);
            if (response.ok) {
                response.json().then((data) => {
                    setTraders(data.map((traderJson: any) => {
                        return {
                            id: traderJson.id,
                            name: traderJson.name,
                            money: traderJson.Money,
                            pnl: traderJson.pnl,
                        }
                    }))
                })
            } else if (response.status == 500) {
                //setError("Username taken");
            } else {
                //setError("Error creating user");
            }
        })
    }
    
    return (
        <>
            <Stack direction="column" justifyContent='center' divider={<Divider flexItem />} sx={{marginY:"10px"}}>
            {traders ? 
                traders.map((trader) => <Avatar alt="Unknown" src="/static/images/avatar/1.jpg" />)
                :<Typography>There are no traders</Typography>}
            </Stack>
        </>
    );

}

export default Traders;