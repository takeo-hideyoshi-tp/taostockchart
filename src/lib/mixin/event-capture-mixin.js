"use strict";
var React = require('react/addons');
var EventCapture = require('../event-capture');
var MouseCoordinates = require('../mouse-coordinates');
var Utils = require('../utils/utils');

var Freezer = require('freezer-js');
// Let's create a freezer store
function getLongValue(value) {
	if (value instanceof Date) {
		return value.getTime();
	}
	return value;
}
var EventCaptureMixin = {
	doesContainChart() {
		var children = Array.isArray(this.props.children)
			? this.props.children
			: [this.props.children];

		return children
			.filter((child) => /Chart$/.test(child.props.namespace))
			.length > 0;
	},
	componentWillMount() {
		//console.log('EventCaptureMixin.componentWillMount');
		if (this.doesContainChart()) {
			var eventStore = new Freezer({
				mouseXY: [0, 0],
				mouseOver: { value: false },
				inFocus: { value: false }
			});
			var zoomEventStore = new Freezer({
				zoom: 0
			});
			var chartStore  = new Freezer({
				charts: [],
				updateMode: { immediate : true }
			});
			var currentItemStore = new Freezer({
				currentItems: [],
				viewPortXRange: [],
				viewPortXDelta: 30
			});

			var stores = {
					eventStore: eventStore,
					chartStore: chartStore,
					currentItemStore: currentItemStore,
					zoomEventStore: zoomEventStore,
					fullData: this.props.data,
					data: this.props.data
				};
			// console.log(stores);
			this.setState(stores);

		}
	},
	getEventStore() {
		return this.state.eventStore;
	},
	updateEventStore(eventStore, zoomEventStore) {
		this.unListen();

		var newState = {
			eventStore: eventStore,
			chartStore: this.state.chartStore,
			currentItemStore: this.state.currentItemStore,
			zoomEventStore: zoomEventStore || this.state.zoomEventStore
		};
		this.setState(newState, () => { this.listen(newState) });
	},
	componentWillUnmount() {
		if (this.doesContainChart()) {
			this.unListen();
		}
	},
	unListen() {
		if (this.state.eventStore !== undefined) {
			this.state.eventStore.off('update', this.eventListener);
		}
		if (this.state.chartStore !== undefined) {
			this.state.chartStore.off('update', this.dataListener);
		}
		if (this.state.zoomEventStore !== undefined) {
			this.state.zoomEventStore.off('update', this.zoomEventListener);
		}
	},
	eventListener(d) {
		//console.log('events updated...', d);
		//this.state.chartStore.get().currentItem.set({value : new Date().getTime()});
		if (this.state.chartStore.get().updateMode.immediate) {
			//console.log('************UPDATING NOW**************');
			/*requestAnimationFrame(function () {
				// console.log('************UPDATING NOW**************');
				this.state.chartStore.get().charts.forEach((chart) => {
					this.updateCurrentItemForChart(chart);
				});
				
				this.forceUpdate();
			}.bind(this));*/
			//console.log(this.state.zoomEventStore.get().zoom);
			this.state.chartStore.get().charts.forEach((chart) => {
				this.updateCurrentItemForChart(chart);
			});
			
			this.forceUpdate();
		}
	},
	componentWillReceiveProps(nextProps) {
		console.log('EventCaptureMixin.componentWillReceiveProps');
		console.log('EventCaptureMixin.componentWillReceiveProps');
		console.log('EventCaptureMixin.componentWillReceiveProps');
		this.calculateViewableData();
	},
	calculateViewableData() {
		var xRange = this.state.currentItemStore.get().viewPortXRange;
		if (xRange.length > 0) {
			var mainChart = this.state.currentItemStore.get().mainChart,
				chart = this.getChartForId(mainChart);
			var data = this.getFullData();
			var filteredData = [];
			for (var i = 0; i < data.length - 1; i++) {
				var each = data[i];
				var nextEach = data[i + 1];

				if (chart.accessors.xAccessor(each) > xRange[0]
					&& chart.accessors.xAccessor(each) < xRange[1]) {
					filteredData.push(each);
				}

				if (filteredData.length > 0 
						&& chart.accessors.xAccessor(each) < xRange[1]
						&& chart.accessors.xAccessor(nextEach) > xRange[1]) {
					filteredData.push(nextEach);
					break;
				}

				if (filteredData.length == 0 
						&& chart.accessors.xAccessor(each) < xRange[0]
						&& chart.accessors.xAccessor(nextEach) > xRange[0]) {
					filteredData.push(each);
				}
			}
			console.log(filteredData.length);
			return filteredData;
		}
		return this.getFullData();
	},
	zoomEventListener(d) {
		//console.log('events updated...', d);
		//this.state.chartStore.get().currentItem.set({value : new Date().getTime()});
		if (this.state.chartStore.get().updateMode.immediate) {


			var zoomData = this.state.zoomEventStore.get(),
				zoomDir = zoomData.zoom,
				mainChart = this.state.currentItemStore.get().mainChart,
				chart = this.getChartForId(mainChart);

			// console.log('************UPDATING NOW**************- zoomDir = ', zoomDir, mainChart);

			this.updateCurrentItemForChart(chart);

			var item = this.getCurrentItemForChart(mainChart).data,
				domain = chart.scales.xScale.domain(),
				centerX = chart.accessors.xAccessor(item),
				leftX = centerX - domain[0],
				rightX = domain[1] - centerX,
				zoom = Math.pow(1 + Math.abs(zoomDir)/2 , zoomDir),
				domainL = (getLongValue(centerX) - ( leftX * zoom)),
				domainR = (getLongValue(centerX) + (rightX * zoom));

			if (centerX instanceof Date) {
				domainL = new Date(domainL);
				domainR = new Date(domainR);
			}

			this.state.currentItemStore.get().viewPortXRange.set([domainL, domainR]);
			// console.log(domainL, domainR);

			this.setState({
				data: this.calculateViewableData()
			})

			// find mainChart
			// get new domainL & R
			// if (this.props.changeIntervalIfNeeded) is present
			//		call this.props.changeIntervalIfNeeded
			//		if ^ returns false
			//			requestAnimationFrame and send down new data
			//			update currentItem
			//		if true
			//			update currentItem
			// else
			//		requestAnimationFrame and send down new data
			//		update currentItem
/*
			requestAnimationFrame(function () {
				this.state.chartStore.get().charts.forEach((chart) => {
					this.updateCurrentItemForChart(chart);
				});


				this.forceUpdate();
			}.bind(this));*/

		}
	},
	dataListener(d) {
		// console.log('data updated from ', this.state.chartStore.get().currentItem, ' to ', d);
		if (this.state.chartStore.get().updateMode.immediate) {
			requestAnimationFrame(function () {
				console.log('************UPDATING NOW**************');
				// console.log(this.state.chartStore.get().charts[0].overlays);
				this.forceUpdate();
			}.bind(this));
		}
	},
	componentDidMount() {
		if (this.doesContainChart()) {
			// this.state.chartStore.get().updateMode.set({ immediate: true });
			this.listen(this.state);
		}
	},
	componentDidUpdate() {
		if (this.doesContainChart()) {
			if (! this.state.chartStore.get().updateMode.immediate)
				this.state.chartStore.get().updateMode.set({ immediate: true });
		}
	},
	listen(stores) {
		// console.log('begining to listen...', stores);

		stores.eventStore.on('update', this.eventListener);
		stores.chartStore.on('update', this.dataListener);
		stores.zoomEventStore.on('update', this.zoomEventListener);
		// stores.chartStore.get().currentItem.getListener().on('update', this.dataListener);
	},
	updatePropsForEventCapture(child) {
		if ("ReStock.EventCapture" === child.props.namespace) {
			// find mainChart and add to zoomeventstores
			if (this.state.currentItemStore.get().mainChart === undefined
				|| this.state.currentItemStore.get().mainChart !== child.props.mainChart) {

				this.state.currentItemStore.get().set({ mainChart: child.props.mainChart });
			}
			return React.addons.cloneWithProps(child, {
				_eventStore: this.state.eventStore,
				_zoomEventStore: this.state.zoomEventStore
			}); 
		}
		return child;
	},
	updatePropsForCurrentCoordinate(child) {
		if ("ReStock.CurrentCoordinate" === child.props.namespace) {
			var chart = this.getChartForId(child.props.forChart);
			var currentItem = this.getCurrentItemForChart(child.props.forChart);

			return React.addons.cloneWithProps(child, {
				_show: this.state.eventStore.get().mouseOver.value,
				_chartData: chart,
				_currentItem: currentItem
			});
		}
		return child;
	},
	updatePropsForMouseCoordinates(child) {
		if ("ReStock.MouseCoordinates" === child.props.namespace) {
			var chart = this.getChartForId(child.props.forChart);
			var currentItem = this.getCurrentItemForChart(child.props.forChart);

			return React.addons.cloneWithProps(child, {
				_show: this.state.eventStore.get().mouseOver.value,
				_mouseXY: this.state.eventStore.get().mouseXY,
				_chartData: chart,
				_currentItem: currentItem
			});
		}
		return child;
	},
	updatePropsForTooltipContainer(child) {
		if ("ReStock.TooltipContainer" === child.props.namespace) {
			return React.addons.cloneWithProps(child, {
				_currentItems: this.state.currentItemStore.get().currentItems,
				_charts: this.state.chartStore.get().charts
			});
		}
		return child;
	},
	updatePropsForEdgeContainer(child) {
		if ("ReStock.EdgeContainer" === child.props.namespace) {
			return React.addons.cloneWithProps(child, {
				_currentItems: this.state.currentItemStore.get().currentItems,
				_charts: this.state.chartStore.get().charts
			});
		}
		return child;
	},
	updatePropsForChart(child) {
		var newChild = child;
		if ("ReStock.Chart" === child.props.namespace) {
			if (this.state.eventStore && this.state.chartStore) {
				var chart = this.getChartForId(newChild.props.id);
				newChild = React.addons.cloneWithProps(newChild, {
					_updateMode: this.state.chartStore.get().updateMode,
					_chartData: chart,
					data: this.getData(),
					fullData: this.getFullData()
				});
			}
		}
		return newChild;
	},
	getData(range) {
		return this.state.data;
	},
	getFullData() {
		return this.state.fullData; // || this.props.data
	},
	getChartForId(chartId) {
		var charts = this.state.chartStore.get().charts;
		var filteredCharts = charts.filter((eachChart) => eachChart.id === chartId);
		if (filteredCharts.length > 1) {
			var errorMessage = `multiple charts with the same id ${ chartId } found`;
			console.warn(errorMessage);
			throw new Error(errorMessage);
		}
		if (filteredCharts.length === 0) {
			var chart = {
				id: chartId,
				scales: { xScale: null, yScale: null },
				accessors: { xAccessor: null, yAccessor: null },
				lastItem: {},
				firstItem: {},
				overlays: [],
				overlayValues: []
			};
			charts = charts.push(chart);
			return this.getChartForId(chartId);
		}
		return filteredCharts[0];
	},
	getCurrentItemForChart(chartId) {
		var currentItems = this.state.currentItemStore.get().currentItems;
		var filteredCurrentItems = currentItems.filter((each) => each.id === chartId);
		if (filteredCurrentItems.length > 1) {
			var errorMessage = `multiple filteredCurrentItems with the same id ${ chartId } found`;
			console.warn(errorMessage);
			throw new Error(errorMessage);
		}
		if (filteredCurrentItems.length === 0) {
			var currentItem = {
				id: chartId,
				data: {}
			};
			currentItems = currentItems.push(currentItem);
			return this.getCurrentItemForChart(chartId);
		}
		return filteredCurrentItems[0];
	},
	updateCurrentItemForChart(chartData) {
		var currentItem = this.getCurrentItemForChart(chartData.id);
		var mouseXY = this.state.eventStore.get().mouseXY;
		if (chartData.scales.xScale === null) {
			console.warn('Verify if the the <Chart id=... > matches with the forChart=... This error likely because a Chart defined with id={%s} is not found', chartData.id);
		}
		var xValue = chartData.scales.xScale.invert(mouseXY[0]);
		var item = Utils.getClosestItem(this.getData(), xValue, chartData.accessors.xAccessor);

		currentItem = currentItem.data.reset(item);
		// console.log(currentItem);
	},
	_renderChildren(children) {
		if (this.doesContainChart()) {
			return React.Children.map(children, (child) => {
				if (typeof child.type === 'string') return child;
				var newChild = child;
				newChild = this.updatePropsForEventCapture(child);
				newChild = this.updatePropsForMouseCoordinates(newChild);
				newChild = this.updatePropsForTooltipContainer(newChild);
				newChild = this.updatePropsForEdgeContainer(newChild);
				newChild = this.updatePropsForChart(newChild);
				newChild = this.updatePropsForCurrentCoordinate(newChild);
				return newChild;
			});
		}
		return children;
	}
};

module.exports = EventCaptureMixin;
