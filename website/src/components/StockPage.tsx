import { Backdrop, Button, Paper, Slide, Stack, Table, TableCell, TableFooter, TableHead, TablePagination, TableRow, Typography, TypographyProps, useTheme } from '@mui/material';
import React, { useRef, useState } from 'react';
import _ from 'lodash';
import CandleChart from './CandleChart';
import { useParams } from 'react-router';
import fakedata from "../assets/fakedata.json"

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
    //console.log(id)
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [buyData, setBuyData] = useState<BuySellData[] | null>(fakebsdata);
    const [sellData, setSellData] = useState<BuySellData[] | null>(fakebsdata);
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
                marginX: "30%",
                marginTop: "3%"
            }}
        >
            {props.id ?? id}
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
            <Paper elevation={3}>
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
                            <TableCell align="right">{s.price}</TableCell>
                            </TableRow>
                    ))}
                </Table>
            </Paper>
            </Stack>
        </Slide>
    )
    return (
        <>
        <IdTypography/>
        <CandleChart data={fakedata.slice(-120)}/>
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