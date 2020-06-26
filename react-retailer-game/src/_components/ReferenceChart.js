import React from 'react';
import * as V from 'victory';
import { VictoryLine,
         //VictoryScatter,
         //VictoryLabel,
         VictoryChart,
         VictoryAxis,
         VictoryTheme
         //VictoryZoomContainer,
         //VictoryContainer
         } from 'victory';

import { hystoricalNoPastData } from '../_utilities/newReferenceGraphData'
import { formatMoney} from '../_utilities/price';

class ReferenceChart extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      historicalData: [],
      activeTimeline: "YTD", // year(YTD), monthly (1M, 6M), daily(1D)
      maxDomainX: 2,
    }
  }

  changeDataChart = (event) => {
    let dateRange = event.target.value ? event.target.value : "YTD";
    let maxDomainX = 2;

    switch (dateRange) {
      case "1D":
      case "6M":
        maxDomainX = 6
        break;
      case "1M":
      case "YTD":
        maxDomainX = 2
        break;
      default:
        break;
    }

    this.setState({
      activeTimeline: dateRange,
      historicalData: hystoricalNoPastData(this.props.suggestedPrice, dateRange),
      maxDomainX
    })
  }


  render() {
    if (this.props.suggestedPrice === undefined) {
      return null;
    }

    const activeTimeline = this.state.activeTimeline;
    const historicalData = this.state.historicalData.length === 0 ? this.props.data : this.state.historicalData;
    const maxDomainX = historicalData.length < 6 ? historicalData.length : this.state.maxDomainX;
    const chartWidth = 520;

    //console.log(maxDomainX, " maxDomainX")
    //if(this.props.suggestedPrice !== undefined){
    //  console.log(this.props.suggestedPrice, " suggestedPrice")
    //}

    //console.log(historicalData, " historicalData");

    return (
      <div className="reference-chart__container">
        <div className="reference-chart__timeline">
          <ul>
            <li><button type="button" onClick={this.changeDataChart} value="1D" className={activeTimeline === "1D" ? "active" : ""}>1D</button></li>
            <li><button type="button" onClick={this.changeDataChart} value="1M" className={activeTimeline === "1M" ? "active" : ""}>1M</button></li>
            <li><button type="button" onClick={this.changeDataChart} value="6M" className={activeTimeline === "6M" ? "active" : ""}>6M</button></li>
            <li><button type="button" onClick={this.changeDataChart} value="YTD" className={activeTimeline === "YTD" ? "active" : ""}>YTD</button></li>
          </ul>
        </div>

        <div className="reference-chart__wrapper">
            <svg style={{position: 'absolute'}}>
                <defs>
                  <linearGradient id="gradientFill" x1="50%" y1="0%" x2="50%" y2="100%" >
                    <stop offset="0%" style={{ stopColor: "#8b6b41", stopOpacity: 0.10 }} />
                    <stop offset="100%" style={{ stopColor: "#8b6b41", stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
            </svg>

            <VictoryChart
              theme={VictoryTheme.material}
              domain={{ x: [1, maxDomainX], y: [0, this.props.suggestedPrice+this.props.suggestedPrice/5]}}
              // domainPadding will add space to each side of VictoryBar to
              // prevent it from overlapping the axis
              domainPadding={{x: 0, y: 5}}
              animate={{duration: 400, onLoad: { duration: 2 }}}
              height={165}
              width={chartWidth}
              padding={{ top: 20, left: 50, right: 30, bottom: 35 }}
            >

              <VictoryAxis
                // tickValues specifies both the number of ticks and where
                // they are placed on the axis
                //tickValues={[1, 2, 3, 4]}
                //tickFormat={["Quarter 1", "Quarter 2", "Quarter 3", "Quarter 4"]}
                style={{
                  axis: { stroke: "#85a5b0"},
                  ticks: { stroke: "#85a5b0", size: 10},
                  grid: {stroke: "transparent"},
                tickLabels: { fontSize: 11, padding: 10, fill: "#85a5b0"}
                }}
                fixLabelOverlap={true}
              />

              {/* <VictoryAxis crossAxis
                offsetY={50}
                style={{
                  axis: { stroke: "#f04a98" }
                }}
                standalone={false}
              />
            */}
              <VictoryAxis
                dependentAxis
                // tickFormat specifies how ticks should be displayed
                tickFormat={(y) => (`${y / 1000}k`)}
                style={{
                  axis: { stroke: "#85a5b0"},
                  grid: { stroke: "#4f6b77"},
                  ticks: { stroke: "#4f6b77", size: 10},
                  tickLabels: { fontSize: 11, padding: 5, fill: "#85a5b0"}
                }}
              />

              <V.VictoryArea
              style={{ data: { stroke: "#e88724", fill: "url(#gradientFill)" }, labels: { fill: "#85a5b0" } }}
              // labels={(d) => `${d.y/1000}`}
              // labelComponent={<VictoryLabel dy={28} dx={5} />}
              barRatio={0.40}
              data={historicalData}
              // data accessor for x values
              x="month"
              // data accessor for y values
              y="price"
              />
              <VictoryLine
                style={{ data: { stroke: "#f04a98", strokeWidth: 2 } }}
                y={(d) => this.props.suggestedPrice+this.props.suggestedPrice/5}
              />

              <V.VictoryLabel
              text="€"
              x={30}
              y={10}
              style={{
                fill: "#ffffff",
                    fontSize: 12
              }}
              textAnchor="end"
              />
              <V.VictoryLabel
                text="list price"
                x={500}
                y={10}
                style={{
                  fill: "#f04a98",
                  fontSize: 12
                }}
                textAnchor="end"
              />
              {/* <VictoryScatter
                style={  { data: { fill: "#62757f" } } }
                size={4}
                data={this.props.data}
                x="month"
                y="price"
              /> */}
            </VictoryChart>
          </div>

        <div className="reference-chart__prices-wrapper">
          <ul>
            <li>{formatMoney(this.props.suggestedPrice)} €<span>higher matched price</span></li>
            <li>{formatMoney(this.props.suggestedPrice)} €<span>average matched price</span></li>
            <li>{formatMoney(this.props.suggestedPrice)} €<span>lowest matched price</span></li>
          </ul>
        </div>
      </div>
    )
  }
}

export default ReferenceChart
