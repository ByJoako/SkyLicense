import React from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, 
  LineChart, Line, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import './Home.css';

// Mock data for Requests Success vs Failures
const requestData = [
  { name: 'January', success: 100, failed: 20 },
  { name: 'February', success: 120, failed: 30 },
  { name: 'March', success: 150, failed: 25 },
  { name: 'April', success: 170, failed: 40 },
];

// Mock data for Requests by Country
const countryData = [
  { name: 'United States', value: 50 },
  { name: 'Mexico', value: 40 },
  { name: 'Canada', value: 30 },
  { name: 'Spain', value: 20 },
  { name: 'Argentina', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6666'];

// Mock total stats
const totalStats = {
  licenses: 150,
  products: 50,
  users: 200
};

const Home = () => {
  return (
    <div className="dashboard-container">
      {/* Total Stats */}
      <div className="dashboard-totals">
        {Object.entries(totalStats).map(([key, value]) => (
          <div className="card" key={key}>
            <div className="card-icon">
              <i className={
                key === 'licenses' ? 'fas fa-key' : 
                key === 'products' ? 'fas fa-box' : 
                'fas fa-users'
              }></i>
            </div>
            <div className="card-details">
              <h2>{key.charAt(0).toUpperCase() + key.slice(1)}</h2>
              <p>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Requests Success vs Failures Chart */}
      <div className="chart-container">
        <h2>Requests: Success vs Failures</h2>
        <div className="chart">
          <LineChart
            width={600}
            height={300}
            data={requestData}
            margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" tick={{ fill: '#fff' }} />
            <YAxis tick={{ fill: '#fff' }} />
            <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
            <Line
              type="monotone"
              dataKey="success"
              stroke="#00C49F"
              name="Success"
              strokeWidth={3}
              dot={{ fill: '#00C49F', r: 5 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              stroke="#FF6F61"
              name="Failed"
              strokeWidth={3}
              dot={{ fill: '#FF6F61', r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </div>
      </div>

      {/* Requests by Country Chart */}
      <div className="chart-container">
        <h2>Requests by Country</h2>
        <div className="chart">
          <PieChart width={400} height={300}>
            <Pie
              data={countryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name }) => name}
            >
              {countryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#2a2a2a', color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#fff' }} />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default Home;