import { List, Stack, Table, TableCell, TableHead, TableRow, Typography, TypographyProps, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import CandleChart from './CandleChart';
import StockPage from './StockPage';
import { StockData } from 'GraphTypes';

type FrontPageProps = {

}

export const SERVER_URL = "http://localhost:5000" //TODO: change to production server

/**
 * Main page
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const FrontPage: React.FC<FrontPageProps> = (props) => {
    const theme = useTheme();
    const graphRef = useRef<HTMLDivElement>(null)
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
        >
            {props.children}
        </Typography>
    );
    useEffect(() => {
        fetch(SERVER_URL)
        .then(response => response.json())
        .then(data => setStockData(data)) //TODO: add error handling
    }, [])
    return (
        <Stack>
            <SubtitleTypography>Stocks</SubtitleTypography>
            {stockData ? 
                <Table>
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
    );

}

export default FrontPage;