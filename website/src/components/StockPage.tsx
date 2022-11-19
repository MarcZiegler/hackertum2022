import { Typography, TypographyProps, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import _ from 'lodash';
import CandleChart from './CandleChart';
import { useParams } from 'react-router';
import fakedata from "../assets/fakedata.json"

type StockPageProps = {
    id?: number
}

/**
 * Stock page
 * @param todo todo
 * @returns component : {JSX.Element}
 */
export const StockPage: React.FC<StockPageProps> = (props) => {
    const { id } = useParams();
    //console.log(id)
    const theme = useTheme();
    const SubtitleTypography = (props: TypographyProps) => (
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
    return (
        <>
        <SubtitleTypography>TODO</SubtitleTypography>
        <CandleChart data={fakedata.slice(-120)}/>
        </>
    );

}

export default StockPage;