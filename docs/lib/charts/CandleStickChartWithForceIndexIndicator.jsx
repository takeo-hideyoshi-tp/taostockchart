"use strict";

import React from "react";
import d3 from "d3";

import * as ReStock from "react-stockcharts";

var { ChartCanvas, Chart, DataSeries, OverlaySeries, EventCapture } = ReStock;

var { CandlestickSeries, HistogramSeries, LineSeries, AreaSeries, RSISeries, StraightLine } = ReStock.series;
var { MouseCoordinates, CurrentCoordinate } = ReStock.coordinates;
var { EdgeContainer, EdgeIndicator } = ReStock.coordinates;

var { TooltipContainer, OHLCTooltip, MovingAverageTooltip, SingleValueTooltip, RSITooltip } = ReStock.tooltip;
var { StockscaleTransformer } = ReStock.transforms;

var { XAxis, YAxis } = ReStock.axes;
var { ATR, EMA, SMA, RSI, ForceIndex } = ReStock.indicator;

var { fitWidth } = ReStock.helper;

class CandleStickChartWithForceIndexIndicator extends React.Component {
	render() {
		var { data, type, width } = this.props;

		return (
			<ChartCanvas width={width} height={550}
				margin={{left: 70, right: 70, top:20, bottom: 30}} initialDisplay={200} 
				dataTransform={[ { transform: StockscaleTransformer } ]}
				data={data} type={type}>
				<Chart id={1} yMousePointerDisplayLocation="right" height={300}
						yMousePointerDisplayFormat={d3.format(".2f")} padding={{ top: 10, right: 0, bottom: 20, left: 0 }}>
					<YAxis axisAt="right" orient="right" ticks={5} />
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<DataSeries id={0} yAccessor={CandlestickSeries.yAccessor} >
						<CandlestickSeries />
					</DataSeries>
					<DataSeries id={1} indicator={EMA} options={{ period: 26 }} >
						<LineSeries />
					</DataSeries>
					<DataSeries id={2} indicator={EMA} options={{ period: 12 }} >
						<LineSeries />
					</DataSeries>
				</Chart>
				<CurrentCoordinate forChart={1} forDataSeries={1} />
				<CurrentCoordinate forChart={1} forDataSeries={2} />
				<Chart id={2} yMousePointerDisplayLocation="left" yMousePointerDisplayFormat={d3.format(".4s")}
						height={150} origin={(w, h) => [0, h - 350]} >
					<YAxis axisAt="left" orient="left" ticks={5} tickFormat={d3.format("s")}/>
					<DataSeries id={0} yAccessor={(d) => d.volume} >
						<HistogramSeries
							fill={(d) => d.close > d.open ? "#6BA583" : "#FF0000"}
							opacity={0.5} />
					</DataSeries>
					<DataSeries id={1} indicator={SMA} options={{ period: 10, source:"volume" }} stroke="#4682B4" fill="#4682B4" >
						<AreaSeries opacity={0.5} />
					</DataSeries>
				</Chart>
				<CurrentCoordinate forChart={2} forDataSeries={0} />
				<CurrentCoordinate forChart={2} forDataSeries={1}/>
				<EdgeContainer>
					<EdgeIndicator itemType="last" orient="right"
						edgeAt="right" forChart={1} forDataSeries={1} />
					<EdgeIndicator itemType="last" orient="right"
						edgeAt="right" forChart={1} forDataSeries={2} />
					<EdgeIndicator itemType="first" orient="left"
						edgeAt="left" forChart={1} forDataSeries={1} />
					<EdgeIndicator itemType="first" orient="left"
						edgeAt="left" forChart={1} forDataSeries={2} />
				</EdgeContainer>
				<Chart id={3} yMousePointerDisplayLocation="right" yMousePointerDisplayFormat={d3.format(".4s")}
						height={100} origin={(w, h) => [0, h - 200]} padding={{ top: 10, right: 0, bottom: 10, left: 0 }} >
					<XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />
					<YAxis axisAt="right" orient="right" ticks={4} tickFormat={d3.format("s")}/>
					<DataSeries id={0} indicator={ForceIndex} >
						<AreaSeries baseAt={scale => scale(0)} />
						<StraightLine yValue={0} />
					</DataSeries>
				</Chart>
				<Chart id={4} yMousePointerDisplayLocation="right" yMousePointerDisplayFormat={d3.format(".4s")}
						height={100} origin={(w, h) => [0, h - 100]} padding={{ top: 10, right: 0, bottom: 10, left: 0 }} >
					<XAxis axisAt="bottom" orient="bottom" />
					<YAxis axisAt="right" orient="right" ticks={4} tickFormat={d3.format("s")}/>
					<DataSeries id={0} indicator={EMA} options={{ period: 13, source: [ "chart_3", "overlay_0" ], stroke: "#000000" }} >
						<AreaSeries baseAt={scale => scale(0)} stroke="steelblue" />
						<StraightLine yValue={0} />
					</DataSeries>
				</Chart>
				<MouseCoordinates xDisplayFormat={d3.time.format("%Y-%m-%d")} />
				<EventCapture mouseMove={true} zoom={true} pan={true} mainChart={1} defaultFocus={false} />
				<TooltipContainer>
					<OHLCTooltip forChart={1} origin={[-40, -10]}/>
					<MovingAverageTooltip forChart={1} onClick={(e) => console.log(e)} origin={[-38, 5]} />
					<SingleValueTooltip forChart={3} forSeries={0}
						yLabel={indicator => `ForceIndex (1)`}
						yDisplayFormat={d3.format(".4s")}
						origin={[-40, 15]}/>
					<SingleValueTooltip forChart={4} forSeries={0}
						yLabel={indicator => `ForceIndex (${ indicator.options().period })`}
						yDisplayFormat={d3.format(".4s")}
						origin={[-40, 15]}/>
				</TooltipContainer>
			</ChartCanvas>
		);
	}
};

CandleStickChartWithForceIndexIndicator.propTypes = {
	data: React.PropTypes.array.isRequired,
	width: React.PropTypes.number.isRequired,
	type: React.PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

CandleStickChartWithForceIndexIndicator.defaultProps = {
	type: "svg",
};
CandleStickChartWithForceIndexIndicator = fitWidth(CandleStickChartWithForceIndexIndicator);

export default CandleStickChartWithForceIndexIndicator;