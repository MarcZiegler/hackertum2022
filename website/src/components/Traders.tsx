import { Alert, Avatar, Box, Button, Checkbox, CircularProgress, Divider, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Paper, Radio, Skeleton, Snackbar, Stack, TableFooter, TextField, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useAuthContext } from './context/AuthContext';
import { SERVER_URL } from './enums/Constants';
import { AuthType } from 'AuthTypes';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BalanceIcon from '@mui/icons-material/Balance';
import PermIdentityIcon from '@mui/icons-material/PermIdentity';
import FilterListIcon from '@mui/icons-material/FilterList';
import { LOCAL_STORAGE_AUTH_KEY } from './Login';
type TraderProps = {

}

export const balanceFormat = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    useGrouping: true,
    maximumSignificantDigits: 4,
}); // $148,000


const nameImageSources = new Map<string,any>()
nameImageSources.set("Elon", {
    src: "http://image.noelshack.com/fichiers/2018/37/6/1537043374-elon-smoke-stick-2.png",
    description:"Eccentric billionaire with a passion for twitter"
})
nameImageSources.set("Chimp", {
    src: "https://media.istockphoto.com/photos/male-chimpanzee-in-business-clothes-picture-id184941527?k=20&m=184941527&s=612x612&w=0&h=ETZiNiSQG18Bn5oUI7Wzcj4Tk-4hCTtWTQBEDXEzvCs=", 
    description:"Can a chimp really be trusted with your money?"
})
nameImageSources.set("Bloomberg", {
    src: "http://www.famousbirthsdeaths.com/wp-content/uploads/2016/03/michael-bloomberg-bio-net-worth-facts.jpg",
    description:"The one and only"
})
nameImageSources.set("Megamind", {
    src: "https://www.fintechtalents.com/wp-content/uploads/AI-and-ethics.jpg",
    description:"Buys low, sells high"
})
nameImageSources.set("Minimind", {
    src: "http://1.bp.blogspot.com/_WgibOsHwQsE/RmNMM_DUoaI/AAAAAAAAEVk/jtfi4R26O9Q/s320/1.jpg",
    description:"Buys high, sells low"
})
nameImageSources.set("Diamondhands", {
    src: "https://s2.coinmarketcap.com/static/img/coins/200x200/8354.png",
    description:"Can't lose when you never sell, right?"
})

const TRADERS_ENDPOINT = SERVER_URL + "/user/traders"
const FOLLOW_ENDPOINT = SERVER_URL + "/follow"
const USER_ENDPOINT = SERVER_URL + "/user"

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
    const [selected, setSelected] = useState<string[]>([]);
    //console.log(selected)

    const autoFetchTradersAuth = () => {
        setLoading(true);
        fetch(TRADERS_ENDPOINT, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'session': auth!.token
            },
        }).then((response) => {
            setLoading(false);
            if (response.ok) {
                response.json().then((data) => {
                    //console.log(data)
                    setTraders(data.map((traderJson: any) => {
                        //console.log(traderJson.username)
                        return {
                            id: traderJson.id,
                            name: traderJson.username,
                            money: traderJson.Money,
                            pnl: traderJson.pnl,
                            isFollowing: traderJson.isFollowing,
                        }
                    }))
                })
            } else if (response.status == 500) {
                //setError("Username taken");
                console.log("error")
            } else {
                //setError("Error creating user");
                console.log("error")
            }
        })
        //refetch user
        fetch(USER_ENDPOINT, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'session': auth!.token
            },
        }).then((response) => {
            //irrespective of loading, avaliability > consistency here
            if (response.ok) {
                response.json().then((data) => {
                    console.log(data)
                    if (setAuth !== null) {
                        let authParsed: AuthType = {
                            token: data.token, //uuid
                            username: data.username, //username
                            money: data.Money, //money
                            pnl: data.pnl, //pnl
                        }
                        //setAuth(authParsed) //TODO: this does nothing
                        window.localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(authParsed))
                    };
                })
            } else if (response.status == 500) {
                //setError("Username taken");
                console.log("error")
            } else {
                //setError("Error creating user");
                console.log("error")
            }
        })
    }

    const subUnsubTrader = (id:string, sub:boolean) => {
        setLoading(true);
        fetch(FOLLOW_ENDPOINT, {
            method: sub?"POST":"DELETE",
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'session': auth!.token
            },
            body: JSON.stringify({
                toFollow: id,
            })
        }).then((response) => {
            setLoading(false);
            if (response.ok) {
                response.json().then((data) => {
                    //console.log(data)
                })
                //console.log("success")
            } else if (response.status == 500) {
                //setError("Username taken");
                console.log("error")
            } else {
                //setError("Error creating user");
                console.log("error")
            }
        })
    }

    useEffect(autoFetchTradersAuth, [])
    
    return (
        <>
        <Typography variant="h6" sx={{margin: "5px"}} align="center">Traders</Typography>
            <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            {traders ? 
                traders.map((trader) => {
                    return (
                        <Tooltip title={nameImageSources.get(trader.name)?.description ?? "New kid on the block?"} arrow placement="right">
                        <ListItem
                            key={trader.money}
                            secondaryAction={
                                <Checkbox
                                    onChange={()=>{
                                        let selectedId = selected.findIndex(e=>e===trader.id);
                                        let newSelected = selectedId !== -1 ?
                                            selected.filter(e=>e !== trader.id)
                                            : selected.concat(trader.id);
                                        setSelected(newSelected)
                                        subUnsubTrader(trader.id, selectedId === -1)
                                    }}
                                    checked={selected.findIndex(e=>e===trader.id) !== -1}
                                    disabled={loading}
                                />
                            }
                            disablePadding
                        >
                            <ListItemButton>
                            <ListItemAvatar>
                                <Avatar
                                src={nameImageSources.get(trader.name)?.src ?? "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn0.iconfinder.com%2Fdata%2Ficons%2Funigrid-flat-human-vol-2%2F90%2F011_101_anonymous_anonym_hacker_vendetta_user_human_avatar-1024.png&f=1&nofb=1&ipt=6ecf7ec9f0412dac9e4befeee519f2ddc7a272dd621c471fae0c6253fbe1ec7e&ipo=images"}
                                />
                            </ListItemAvatar>
                            <ListItemText primary={trader.name} sx={{marginX:"5px"}} />
                            <ListItemText secondary={balanceFormat.format(trader.money)} secondaryTypographyProps={{color:trader.pnl >= 0? "green": "red"}} sx={{marginRight:"5px"}}/>
                            <ListItemText secondary={balanceFormat.format(trader.pnl)} sx={{marginRight:"5px"}}/>
                            </ListItemButton>
                        </ListItem>
                        </Tooltip>
                    )
                })
                :<CircularProgress/>}
            </List>
            <Divider/>
            <Typography variant="h6" sx={{margin: "5px"}} align="center">Your stats</Typography>
            <List dense sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <ListItem
                disablePadding
                alignItems='center'
            >
                <ListItemIcon>
                    <PermIdentityIcon sx={{marginLeft:"5px"}}/>
                </ListItemIcon>
                <ListItemText primary={auth?.username} />
            </ListItem>
            <ListItem
                disablePadding
                alignItems='center'
            >
                <ListItemIcon>
                    <AttachMoneyIcon sx={{marginLeft:"5px"}}/>
                </ListItemIcon>
                <ListItemText primary={balanceFormat.format(auth?.money ?? 0)} primaryTypographyProps={{color:(auth?.money ?? 0) > 0? "green": "red"}}/>
            </ListItem>
            <ListItem
                disablePadding
                alignItems='center'
            >
                <ListItemIcon>
                    <BalanceIcon sx={{marginLeft:"5px"}}/>
                </ListItemIcon>
                <ListItemText primary={balanceFormat.format(auth?.pnl ?? 0)} primaryTypographyProps={{color:(auth?.pnl ?? 0) > 0? "green": ((auth?.pnl ?? 0) === 0?"grey":"red")}}/>
                <ListItemText secondary={"(PNL)"}/>
                <TableFooter>
                    <FilterListIcon sx={{opacity:"20%", position:"absolute", left:"50%", transform:"translate(-7%, 70%)", scale: "10 1"}}/>
                </TableFooter>
            </ListItem>
            </List>
        </>
    );

}

export default Traders;