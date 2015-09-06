"use strict";

import React from "react";

import Utils from "../utils/utils";
import ChartDataUtil from "../utils/ChartDataUtil";
import ToolTipText from "./ToolTipText";
import ToolTipTSpanLabel from "./ToolTipTSpanLabel";

class MACDTooltip extends React.Component {
	render() {
		var chartData = ChartDataUtil.getChartDataForChart(this.props, this.context);
		var options = chartData.config.indicatorOptions;

		var item = ChartDataUtil.getCurrentItemForChart(this.props, this.context);
		var macd = chartData.config.accessors.yAccessor(item);
		var format = chartData.config.mouseCoordinates.format;

		var MACDLine = (macd && macd.MACDLine && format(macd.MACDLine)) || "n/a";
		var signalLine = (macd && macd.signalLine && format(macd.signalLine)) || "n/a";
		var histogram = (macd && macd.histogram && format(macd.histogram)) || "n/a";

		var { origin, height, width } = chartData.config;
		var relativeOrigin = typeof this.props.origin === "function"
			? this.props.origin(this.context.width, this.context.height)
			: this.props.origin;
		var absoluteOrigin = [origin[0] + relativeOrigin[0], origin[1] + relativeOrigin[1]]

		return (
			<g transform={`translate(${ absoluteOrigin[0] }, ${ absoluteOrigin[1] })`}>
				<ToolTipText x={0} y={0}
					fontFamily={this.props.fontFamily} fontSize={this.props.fontSize}>
					<ToolTipTSpanLabel>MACD (</ToolTipTSpanLabel>
						<tspan fill={options.stroke.MACDLine}>{options.slow}</tspan>
						<ToolTipTSpanLabel>, </ToolTipTSpanLabel>
						<tspan fill={options.stroke.MACDLine}>{options.fast}</tspan>
					<ToolTipTSpanLabel>): </ToolTipTSpanLabel><tspan>{MACDLine}</tspan>
					<ToolTipTSpanLabel> Signal (</ToolTipTSpanLabel>
						<tspan fill={options.stroke.signalLine}>{options.signal}</tspan>
						<ToolTipTSpanLabel>): </ToolTipTSpanLabel><tspan>{signalLine}</tspan>
					<ToolTipTSpanLabel> Histogram: </ToolTipTSpanLabel><tspan>{histogram}</tspan>
				</ToolTipText>
			</g>
		);
	}
}

MACDTooltip.contextTypes = {
	chartData: React.PropTypes.array.isRequired,
	currentItems: React.PropTypes.array.isRequired,
	width: React.PropTypes.number.isRequired,
	height: React.PropTypes.number.isRequired,
};

MACDTooltip.propTypes = {
	forChart: React.PropTypes.number.isRequired,
	accessor: React.PropTypes.func.isRequired,
	xDisplayFormat: React.PropTypes.func.isRequired,
	origin: React.PropTypes.oneOfType([
				React.PropTypes.array
				, React.PropTypes.func
			]).isRequired,
	fontFamily: React.PropTypes.string,
	fontSize: React.PropTypes.number,
};

MACDTooltip.defaultProps = {
	namespace: "ReStock.MACDTooltip",
	accessor: (d) => { return {date: d.date, open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume}; },
	xDisplayFormat: Utils.displayDateFormat,
	origin: [0, 0]
};

module.exports = MACDTooltip;
// export default MACDTooltip;
