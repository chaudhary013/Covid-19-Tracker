import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import 'chartjs-adapter-moment';
import { enUS } from 'date-fns/locale'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  TimeScale,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  legend: {
    display: false,
  },
  elements: {
    line: {
      tension: 0.1,
    },
    point: {
      radius: 0,
    },
  },
  maintainAspectRatio: false,
  tooltips: {
    mode: "index",
    intersect: false,
    callbacks: {
      label: (tooltipItem, data) => {
        const index = tooltipItem.dataIndex;
        const dataset = data.datasets[tooltipItem.datasetIndex];
        const value = dataset.data[index].y;
        return "Value: " + numeral(value).format("+0,0");
      },
    },
  },
  scales: {
    xAxes: [
      {
        type: "time",
        time: {
          format: "MM/DD/YY",
          tooltipFormat: "ll",
        },
      },
    ],
    yAxes: [
      {
        gridLines: {
          display: false,
        },
        ticks: {
          callback: (value, index, values) => {
            return numeral(value).format("0a");
          },
        },
      },
    ],
  },
  adapters: { 
    date: {
      locale: enUS, 
    },
  },
};

const buildChartData = (data, casesType) => {
  let chartData = [];
  let lastDataPoint;
  for (let date in data.cases) {
    if (data[casesType] && lastDataPoint) {
      let newDataPoint = {
        x: date,
        y: (data[casesType][date] - lastDataPoint),
      };
      chartData.push(newDataPoint);
    }
    lastDataPoint = data[casesType][date];
  }
  return chartData;
};

function LineGraph({ casesType }) {
  const [data, setData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120");
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        let chartData = buildChartData(data, casesType);
        setData(chartData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [casesType]);

  return (
    <div>
      {data?.length > 0 && (
        <Line
          data={{
            datasets: [
              {
                backgroundColor: "rgba(204, 16, 52, 0.5)",
                borderColor: "#CC1034",
                data: data,
              },
            ],
          }}
          options={options}
        />
      )}
    </div>
  );
}

export default LineGraph;
