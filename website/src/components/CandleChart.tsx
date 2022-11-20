import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box } from '@mui/system';
import * as d3 from "d3";
import { debounce } from 'lodash';
import _ from 'lodash';
import { GraphData } from 'GraphTypes';
import { CandlestickChart } from './candle';
import { SERVER_URL } from './enums/Constants';
import { Backdrop, CircularProgress } from '@mui/material';

type CandleProps = {
  data: GraphData[] | null;
}

/**
 * Candlestick graph implementation. Takes care of data updates and visualisation.
 * @param todo todo
 * @returns component : {JSX.Element}
 */
const CandleChart: React.FC<CandleProps> = (props) => {
  const containerRef = useRef<any>(null);
  // SVG debounced with to trigger rerender on window size change
  const [width, setWidth] = useState<number | undefined>(1000);
  //console.log(props?.data)
  useEffect(() => {
    // Debounced rerender on resize
    const handleResize = debounce(() => setWidth(containerRef.current.clientWidth), 500);
    window.addEventListener('resize', handleResize);

    //Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  useLayoutEffect(() => {
    // Generate candlestick graph
    containerRef.current.clientWidth && setWidth(containerRef.current.clientWidth);
    if (props.data) {
      CandlestickChart(props.data, {
        date: (d:any) => d.Date,
        high: (d:any) => d.High,
        low: (d:any) => d.Low,
        open: (d:any) => d.Open,
        close: (d:any) => d.Close,
        yLabel: "↑ Price ($)",
        width: width, //TODO: make dynamic
        height: 300
      } as any);
    }
    
    //console.log(width)
    return () => {
      // cleanup
      d3.select("svg#content").selectAll('*').remove();
    }
  }, [props.data, width]);

  return (
    <>
      <Backdrop open={props.data === null} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box sx={{ zIndex: 5 , position: "relative", marginLeft: "2%", marginRight: "2%"}}>
        <svg width="100%" height={window.innerHeight} ref={containerRef} style={{position: "absolute" , background: "white"}}>
          <svg id="content">
          </svg>
        </svg>
      </Box>
    </>
  );
};

export default CandleChart;