import { useEffect, useState } from "react";
import Head from "next/head";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Home() {
  const [data, setData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [maxValues, setMaxValues] = useState({});
  const [minValues, setMinValues] = useState({});
  const [avgValues, setAvgValues] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://api-smarthome.vercel.app/sensor/get");
        const result = await response.json();
        
        // Urutkan data berdasarkan timestamp terbaru
        const sortedData = result.data.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Ambil data terbaru
        setData(sortedData[0]);
        
        // Ambil 10 data terbaru untuk grafik
        setHistoricalData(sortedData.slice(0, 10).reverse());

        // Hitung nilai maksimum, minimum, dan rata-rata
        const temperatures = result.data.map(item => item.temperature);
        const humidities = result.data.map(item => item.humidity);
        const waterLevels = result.data.map(item => item.water_level);

        setMaxValues({
          temperature: Math.max(...temperatures),
          humidity: Math.max(...humidities),
          water_level: Math.max(...waterLevels),
        });

        setMinValues({
          temperature: Math.min(...temperatures),
          humidity: Math.min(...humidities),
          water_level: Math.min(...waterLevels),
        });

        setAvgValues({
          temperature: (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2),
          humidity: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2),
          water_level: (waterLevels.reduce((a, b) => a + b, 0) / waterLevels.length).toFixed(2),
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    // Panggil fetchData setiap 1 detik
    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  const areaChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sensor Data Timeline'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const areaChartData = {
    labels: historicalData.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        fill: true,
        label: 'Temperature (°C)',
        data: historicalData.map(item => item.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
      {
        fill: true,
        label: 'Humidity (%)',
        data: historicalData.map(item => item.humidity),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
      },
      {
        fill: true,
        label: 'Water Level (%)',
        data: historicalData.map(item => item.water_level),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }
    ]
  };

  const barChartData = {
    labels: ['Temperature', 'Humidity', 'Water Level'],
    datasets: [
      {
        label: 'Current Values',
        data: data ? [data.temperature, data.humidity, data.water_level] : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(53, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(53, 162, 235)',
          'rgb(75, 192, 192)'
        ],
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Current Sensor Values'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <>
      <Head>
        <title>Web Monitoring</title>
        <link rel="stylesheet" href="/style.css" />
      </Head>
      <div className="container">
        <h1>Smart Home Monitoring</h1>
        {data ? (
          <>
            <div className="data-grid">
              <div className="data-item temperature">
                <span className="data-label">Temperature</span>
                <span className="data-value">{data.temperature}°C</span>
                <span className="data-label">Max: {maxValues.temperature}°C</span>
                <span className="data-label">Min: {minValues.temperature}°C</span>
                <span className="data-label">Avg: {avgValues.temperature}°C</span>
              </div>
              <div className="data-item humidity">
                <span className="data-label">Humidity</span>
                <span className="data-value">{data.humidity}%</span>
                <span className="data-label">Max: {maxValues.humidity}%</span>
                <span className="data-label">Min: {minValues.humidity}%</span>
                <span className="data-label">Avg: {avgValues.humidity}%</span>
              </div>
              <div className="data-item water-level">
                <span className="data-label">Water Level</span>
                <span className="data-value">{data.water_level}%</span>
                <span className="data-label">Max: {maxValues.water_level}%</span>
                <span className="data-label">Min: {minValues.water_level}%</span>
                <span className="data-label">Avg: {avgValues.water_level}%</span>
              </div>
              <div className="data-item distance">
                <span className="data-label">Distance</span>
                <span className="data-value">{data.distance} cm</span>
              </div>
              <div className="data-item timestamp">
                <span className="data-label">Last Updated</span>
                <span className="data-value" style={{fontSize: '1.2em'}}>
                  {new Date(data.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="charts-grid">
              <div className="chart-container">
                <Line options={areaChartOptions} data={areaChartData} />
              </div>
              <div className="chart-container">
                <Bar options={barChartOptions} data={barChartData} />
              </div>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </>
  );
}
