import { Button, Drawer, List, Stack, Table, TableCell, TableHead, TableRow, Typography, TypographyProps, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import CandleChart from './CandleChart';
import StockPage from './StockPage';
import { StockData } from 'GraphTypes';
import Traders from './Traders';
import { SERVER_URL } from './enums/Constants';
import ListAltIcon from '@mui/icons-material/ListAlt';

type FrontPageProps = {

}

/**
 * Main page
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const FrontPage: React.FC<FrontPageProps> = (props) => {
    const theme = useTheme();
    const graphRef = useRef<HTMLDivElement>(null)
    const [openDrawer, setOpenDrawer] = useState(false);
    const [stockData, setStockData] = useState<StockData[] | null>([
        {
            id: 984312,
            tag: "AAPL",
            name: "Apple Inc."
        },
        {
            id: 43143,
            tag: "GME",
            name: "GameStop Corp."
        },
    ]);
    const SubtitleTypography = (props: TypographyProps) => (
        <Typography
            color={theme.palette.primary.main}
            variant="h4"
            sx={{
                marginX: "30%",
                marginTop: "3%"
            }}
            align="center"
        >
            {props.children} <ListAltIcon fontSize="large"/>
        </Typography>
    );
    useEffect(() => {
        fetch(SERVER_URL)
        .then(response => response.json())
        .then(data => setStockData(data.splice(-100))) //TODO: add error handling
    }, [])
    return (
        <>
        <Button onClick={()=>setOpenDrawer(true)} sx={{position:"fixed",top:"0",left:"", marginLeft:"5px",marginTop:"5px"}}>Show Traders</Button>
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
                <Table style={{marginLeft: "2%", marginRight:"2%", width: "96%"}}>
                    <TableHead>
                    <TableRow>
                        <TableCell>Company</TableCell>
                        <TableCell align="right">Tag</TableCell>
                        <TableCell align="right">Volume</TableCell>
                        <TableCell align="right">Spread</TableCell>
                        <TableCell align="right">Volatility</TableCell>
                    </TableRow>
                    </TableHead>
                    {stockData.map((s) => (
                        <TableRow
                            key={s.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 },
                                '&:hover': {backgroundColor: '#f5f5f5', cursor: "pointer" }
                            }}
                            onClick={() => {
                                window.location.assign(`/stock/${s.id}`)
                            }}
                                
                            >
                            <TableCell component="th" scope="row">
                                {s.name}
                            </TableCell>
                            <TableCell align="right">{s.tag}</TableCell>
                            <TableCell align="right">{s.name}</TableCell>
                            <TableCell align="right">{s.name}</TableCell>
                            <TableCell align="right">{s.name}</TableCell>
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