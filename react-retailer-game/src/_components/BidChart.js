import React from 'react';
import {ResponsiveContainer, AreaChart, XAxis, YAxis, Area, ReferenceLine} from "recharts";

function nFormatter(num, digits) {
    const si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "k" },
        { value: 1E6, symbol: "M" },
        { value: 1E9, symbol: "G" },
        { value: 1E12, symbol: "T" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    let i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

class BidChart extends React.Component {
  render() {
    const data = this.props.data.filter(obj => obj.offer >= 0);
    return (
        <div style={{ width: 'calc(100% + 25px)', height: 200, marginLeft: '-25px' }}>
            <p style={{color: '#f04a98', textAlign: 'right', marginBottom: 0}}>
                list price
            </p>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{
                        top: 10, right: 0, left: 0, bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorUv" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="5%" stopColor="#704418" stopOpacity={0.47}/>
                            <stop offset="95%" stopColor="#66411a" stopOpacity={0.06}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="bidder" />
                    <YAxis tickFormatter={(data) => nFormatter(data, 1)} />
                    <ReferenceLine alwaysShow y={this.props.suggestedPrice} stroke="#f04a98" />
                    <Area type="monotone" dataKey="offer" stroke="#995d20" fillOpacity={1} fill="url(#colorUv)" isAnimationActive={false} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
  }
}

export default BidChart
