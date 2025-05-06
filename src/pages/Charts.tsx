import React, { useState } from "react";
import { Box, Typography, Paper, AppBar, Toolbar, Button, IconButton } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Dark mode functionality
const Charts: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev ? "true" : "false");
      return !prev;
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#1976D2" },
      secondary: { main: "#FF5722" },
    },
    typography: { fontFamily: "'Roboto', 'Arial', sans-serif" },
  });

  // Example stock data for presentation purposes
  const stockData = [
    { date: "2025-03-27", actual: 215.50, predicted: 216.00 },
    { date: "2025-03-28", actual: 218.90, predicted: 219.40 },
    { date: "2025-03-29", actual: 217.80, predicted: 218.00 },
    { date: "2025-03-30", actual: 220.10, predicted: 220.30 },
  ];

  const data = {
    labels: stockData.map((entry) => entry.date),
    datasets: [
      {
        label: "Actual Prices",
        data: stockData.map((entry) => entry.actual),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
      },
      {
        label: "Predicted Prices",
        data: stockData.map((entry) => entry.predicted),
        borderColor: "orange",
        backgroundColor: "rgba(255, 165, 0, 0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as "top",
      },
      title: {
        display: true,
        text: "Stock Price Predictions vs. Actual Data",
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Centered Navigation Links */}
          <Box sx={{ display: "flex", gap: 4 }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/tutorial">Tutorial</Button>
            <Button color="inherit" component={Link} to="/charts">Charts</Button>
            <Button color="inherit" component={Link} to="/predictions">Predictions</Button>
          </Box>

          {/* Dark Mode Toggle at Far Right */}
          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Charts Page Content */}
      <Box sx={{ textAlign: "center", padding: 4 }}>
        <Typography variant="h4" color="primary">
          Stock Prediction Charts
        </Typography>
        <Paper sx={{ padding: 3, marginTop: 2 }}>
          <Typography variant="body1">
            This chart compares actual stock prices with predicted values to analyze the accuracy of forecasts.
          </Typography>
          <Line data={data} options={options} />
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Charts;