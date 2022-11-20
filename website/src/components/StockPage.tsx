import { Backdrop, Button, Fade, Paper, Slide, Stack, Table, TableCell, TableFooter, TableHead, TablePagination, TableRow, Typography, TypographyProps, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import CandleChart from './CandleChart';
import { useParams } from 'react-router';
//import fakedata from "../assets/fakedata.json"
import { SERVER_URL } from './enums/Constants';
import { GraphData } from 'GraphTypes';
import { useAuthContext } from './context/AuthContext';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import SouthIcon from '@mui/icons-material/South';
import NorthIcon from '@mui/icons-material/North';
import { balanceFormat } from './Traders';
//import * as d3 from "d3";

type StockPageProps = {
    id?: number
}
type BuySellData = {
    price: number,
    quantity: number,
}

const fakebsdata = [
    {
        price: 10,
        quantity: 100
    },
    {
        price: 20,
        quantity: 420
    }
]

/**
 * Stock page
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const StockPage: React.FC<StockPageProps> = (props) => {
    const { id } = useParams();
    const {auth, setAuth} = useAuthContext();
    const HISTORIC_DATA_ENDPOINT = SERVER_URL + "/ticker/" + id;
    const LIVE_DATA_ENDPOINT = SERVER_URL + "/market-action/params";
    //console.log(id)
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [buyData, setBuyData] = useState<BuySellData[] | null>(null);
    const [sellData, setSellData] = useState<BuySellData[] | null>(null);
    const [data, setData] = useState<GraphData[] | null>(null);

    // Set interval to pull raw data
    useEffect(() => {
        const historicUpdateInterval = setInterval(() => {
            // Update data
            fetch(HISTORIC_DATA_ENDPOINT, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'session': auth!.token
                },
            })
            .then(response => response.json())
            .then(data => {
                //console.log(data)
                //const egdate = data.historicalData[0].executed_at;
                //console.log(egdate)
                //console.log(new Date(egdate));
                //const d2 = data.historicalData[data.historicalData.length-1].executed_at;
                //console.log(d2)
                //console.log(new Date(d2));
                setData(data.historicalData.map((d: any) => {
                    return {
                        Date: d.executed_at,
                        Open: d.FirstPrice,
                        High: d.MaxPrice,
                        Low: d.MinPrice,
                        Close: d.FirstPrice, //This is worng
                        Volume: d.Volume
                    } as GraphData
                }))
            }) //TODO: add error handling
        }, 1000);

        const liveUpdateInterval = setInterval(() => {
            // Update data
            const paramUrl = new URL(LIVE_DATA_ENDPOINT)
            paramUrl.searchParams.append("id",id!);
            paramUrl.searchParams.append("type","BUY");
            fetch(paramUrl, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'session': auth!.token
                }
            })
            .then(response => response.json())
            .then(data => {
                //console.log(data)
                setBuyData(data.map((d: any) => {
                    return {
                        price: d.price,
                        quantity: d.shares
                    }
                }).filter((e:any)=>e.quantity>0))
            }) //TODO: add error handling
            paramUrl.searchParams.set("type","SELL");
            //console.log(paramUrl)
            fetch(paramUrl, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                    'session': auth!.token
                }
            })
            .then(response => response.json())
            .then(data => {
                //console.log(data)
                setSellData(data.map((d: any) => {
                    return {
                        price: d.price,
                        quantity: d.shares
                    }
                }).filter((e:any)=>e.quantity>0))
            }) //TODO: add error handling
        }, 1000); //TODO: make interval smaller
        return () => {
            clearInterval(historicUpdateInterval);
            clearInterval(liveUpdateInterval);
        }
    }, []);
    const handleClose = () => {
      setOpen(false);
    };
    const handleToggle = () => {
      setOpen(!open);
    };
    const IdTypography = (props: TypographyProps) => (
        <Typography
            color={theme.palette.primary.main}
            variant="h4"
            sx={{
                marginTop: "3%"
            }}
            align="center"
        >
            {(props.id ?? id)?.toUpperCase()} <Fade in timeout={1000}><ShowChartIcon fontSize='large' /></Fade>
        </Typography>
    );

    const LiveOrders = (isBuy:boolean) => (
        <Slide direction={isBuy?"right":"left"} in={open}>
            <Stack spacing={2} direction="row" sx={{
                position:"fixed",
                left: isBuy?"0":"auto",
                right: isBuy?"auto":"0",
                transform: "translate(0, -50%)",
                marginX: "3px",
            }}>
            <Paper elevation={3} sx={{height:"95vh", marginX:"10px"}}>
                {!isBuy?
                    <NorthIcon color="error" sx={{position:"relative", left:"50%", transform: "translate(-50%, 0)", marginTop:"5px"}}></NorthIcon>
                    :<SouthIcon color="success" sx={{position:"relative", left:"50%", transform: "translate(-50%, 0)", marginTop:"5px"}}></SouthIcon>
                }
                <Typography align='center' sx={{margin: "2%"}}>{isBuy?"Buy":"Sell"} Orders</Typography>
                <Table stickyHeader size="small">
                    <TableHead>
                    <TableRow>
                        <TableCell>Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                    </TableRow>
                    </TableHead>
                    {(isBuy?buyData??[]:sellData??[]).map((s) => (
                        <TableRow
                            key={s.price}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 },
                                '&:hover': {backgroundColor: '#f5f5f5', cursor: "pointer" }
                            }}
                            >
                            <TableCell component="th" scope="row">
                                {s.quantity}
                            </TableCell>
                            <TableCell align="right">{balanceFormat.format(s.price)}</TableCell>
                            </TableRow>
                    ))}
                    <TableFooter>
                        <FilterListIcon sx={{opacity:"20%", position:"absolute", left:"50%", transform:"translate(-12%, 0)", scale: "4 1"}}/>
                    </TableFooter>
                </Table>
            </Paper>
            </Stack>
        </Slide>
    )
    //data.slice(-120)
    return (
        <>
        <ArrowBackIcon 
            fontSize="large"
            sx={{
                position:"fixed", 
                top:"0", 
                margin:"5px",
                cursor: "pointer"
            }}
            onClick={() => window.location.assign(`/`)}
        />
        <IdTypography/>
        <CandleChart data={data?.slice(-100) ?? null}/>
        <Button 
            onClick={handleToggle} 
            sx={{
                textTransform: "none", 
                zIndex: (theme) => theme.zIndex.drawer + 1, 
                position: "fixed", 
                bottom: "0", 
                left: "0", 
                width: "100%", 
                height: "10%"
            }}
        >
            View Live Orders
        </Button>
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={open}
            onClick={handleClose}
        >
            {LiveOrders(false)}
            {LiveOrders(true)}
        </Backdrop>
        </>
    );

}

export default StockPage;