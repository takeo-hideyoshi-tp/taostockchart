'use strict';
var React = require('react/addons');
var EdgeCoordinate = require('./edge-coordinate')
var Utils = require('./utils/utils')

var CrossHair = React.createClass({displayName: "CrossHair",
	propTypes: {
		_height: React.PropTypes.number.isRequired,
		_width: React.PropTypes.number.isRequired,
		_mouseXY: React.PropTypes.array.isRequired,
		_xDisplayValue: React.PropTypes.string.isRequired,
		_yDisplayValue: React.PropTypes.string.isRequired,
		yAxisPad: React.PropTypes.number.isRequired
	},
	shouldComponentUpdate:function(nextProps, nextState) {
		return nextProps._mouseXY !== this.props._mouseXY
	},
	getDefaultProps:function() {
		return {
			namespace: "ReStock.CrossHair",
			yAxisPad: 5
		}
	},
	render:function() {
		return (
			React.createElement("g", {className: 'crosshair '}, 
				React.createElement(EdgeCoordinate, {
					type: "horizontal", 
					className: "horizontal", 
					show: true, 
					x1: 0, y1: this.props._mouseXY[1], 
					x2: this.props._width + this.props.yAxisPad, y2: this.props._mouseXY[1], 
					coordinate: this.props._yDisplayValue, 
					edgeAt: this.props._width + this.props.yAxisPad, 
					orient: "right"}
					), 
				React.createElement(EdgeCoordinate, {
					type: "vertical", 
					className: "horizontal", 
					show: true, 
					x1: this.props._mouseXY[0], y1: 0, 
					x2: this.props._mouseXY[0], y2: this.props._height, 
					coordinate: this.props._xDisplayValue, 
					edgeAt: this.props._height, 
					orient: "bottom"}
					)
			)
		);
	}
});

module.exports = CrossHair;
