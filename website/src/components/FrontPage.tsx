import {Button, Drawer, List, Stack, Table, TableCell, TableHead, TableRow, Typography, TypographyProps, useTheme} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';
import _ from 'lodash';
import CandleChart from './CandleChart';
import StockPage from './StockPage';
import {StockData} from 'GraphTypes';
import Traders from './Traders';
import AlignHorizontalLeftSharpIcon from '@mui/icons-material/AlignHorizontalLeftSharp';
import AlignHorizontalRightSharpIcon from '@mui/icons-material/AlignHorizontalRightSharp';
import GroupsIcon from '@mui/icons-material/Groups';
import {SERVER_URL} from './enums/Constants';
import {useAuthContext} from './context/AuthContext';

type FrontPageProps = {}

/**
 * Main page
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const FrontPage: React.FC<FrontPageProps> = (props) => {
    const {auth} = useAuthContext();
    const theme = useTheme();
    const graphRef = useRef<HTMLDivElement>(null)
    const [openDrawer, setOpenDrawer] = useState(false);
    const [stockData, setStockData] = useState<StockData[] | null>([
        {
            id: 984312,
            tag: "LOADING",
            name: "LOADING",
            lastPrice: 0,
            lastAmount: 0,
        },
    ]);
    const SubtitleTypography = (props: TypographyProps) => (
        <Typography
            variant="h4"
            sx={{
                marginX: "30%",
                marginTop: "3%"
            }}
            align="center"
        >
            <AlignHorizontalRightSharpIcon  opacity="30%"/> {props.children} <AlignHorizontalLeftSharpIcon opacity="30%"/>
        </Typography>
    );
    useEffect(() => {
        fetch(SERVER_URL + "/ticker", {
            method: "GET",
            headers: {
                "session": auth?.token || "",
            }
        })
            .then(response => response.json())
            .then(data => {
                setStockData(data.map(function (m: any) {
                    return {
                        id: m.id,
                        tag: m.ticker,
                        name: m.name,
                        lastPrice: m.TickerHistory[0].price,
                        lastAmount: m.TickerHistory[0].amount,
                    }
                }))
            }) //TODO: add error handling
    }, [])
    return (
        <>
        <Button size="large" startIcon={<GroupsIcon fontSize='large'/>} onClick={()=>setOpenDrawer(true)} sx={{position:"fixed",top:"0",left:"", marginLeft:"10px",marginTop:"10px", textTransform:"none"}}>Setup Traders</Button>
        <Stack>
            <SubtitleTypography>Stocks</SubtitleTypography>
            <Drawer
                anchor="left"
                open={openDrawer}
                onClose={() => {setOpenDrawer(false)}}
            >
                <Traders/>
            </Drawer>
            {stockData ?
                <Table style={{marginLeft: "2%", marginRight: "2%", width: "96%"}}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Company</TableCell>
                            <TableCell align="right">Tag</TableCell>
                            <TableCell align="right">Last Sale Price</TableCell>
                            <TableCell align="right">Spread</TableCell>
                        </TableRow>
                    </TableHead>
                    {stockData.map((s: StockData) => (
                        <TableRow
                            key={s.name}
                            sx={{
                                '&:last-child td, &:last-child th': {border: 0},
                                '&:hover': {backgroundColor: '#f5f5f5', cursor: "pointer"}
                            }}
                            onClick={() => {
                                window.location.assign(`/stock/${s.tag}`)
                            }}

                        >
                            <TableCell component="th" scope="row">
                                {s.name}
                            </TableCell>
                            <TableCell align="right">{s.tag}</TableCell>
                            <TableCell align="right">{s.lastPrice}</TableCell>
                            <TableCell align="right">{s.lastAmount}</TableCell>
                        </TableRow>
                    ))}
                </Table>
                :
                <Typography>Loading...</Typography>
            }
        </Stack>
        </>
    );
}

export default FrontPage;