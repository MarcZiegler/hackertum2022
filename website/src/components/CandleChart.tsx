import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Box } from '@mui/system';
import * as d3 from "d3";
import { debounce } from 'lodash';
import _ from 'lodash';
import { GraphData } from 'GraphTypes';
import { CandlestickChart } from './candle';
import { SERVER_URL } from './FrontPage';

type CandleProps = {
  data: any;
}

/**
 * Candlestick graph implementation. Takes care of data updates and visualisation.
 * @param todo todo
 * @returns component : {JSX.Element}
 */
const CandleChart: React.FC<CandleProps> = (props) => {
  const containerRef = useRef<any>(null);
  const [data, setData] = useState(props.data as GraphData[]);
  // SVG debounced with to trigger rerender on window size change
  const [width, setWidth] = useState<number | undefined>(1000);

  useEffect(() => {
    // Debounced rerender on resize
    const handleResize = debounce(() => setWidth(containerRef.current.clientWidth), 500);
    window.addEventListener('resize', handleResize);

    // Set interval to update data
    const updateInterval = setInterval(() => {
      // Update data
      return;
      fetch(SERVER_URL)
        .then(response => response.json())
        .then(data => setData(data)) //TODO: add error handling
    }, 1000);

    //Cleanup on unmount
    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [])

  useLayoutEffect(() => {
    // Generate candlestick graph
    containerRef.current.clientWidth && setWidth(containerRef.current.clientWidth);
    CandlestickChart(data, {
      date: (d:any) => new Date(d.Date),
      high: (d:any) => d.High,
      low: (d:any) => d.Low,
      open: (d:any) => d.Open,
      close: (d:any) => d.Close,
      yLabel: "↑ Price ($)",
      width:width, //TODO: make dynamic
      height: 300
    } as any);
    console.log(width)
    return () => {
      // cleanup
      d3.select("svg#content").selectAll('*').remove();
    }
  }, [data, width]);

  return (
    <>
      <Box sx={{ zIndex: 5 , position: "relative"}}>
        <svg width="100%" height={window.innerHeight} ref={containerRef} style={{position: "absolute" , background: "white"}}>
          <svg id="content">
          </svg>
        </svg>
      </Box>
    </>
  );
};

export default CandleChart;