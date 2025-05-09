import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, AppBar, Toolbar, Button, IconButton, CircularProgress } from "@mui/material";
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

interface Prediction {
  Ticker: string;
  Date: string;
  Predicted_Open: number;
  Predicted_Close: number;
}

// Dark mode functionality
const Charts: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        // Get the ticker from localStorage
        const savedData = localStorage.getItem("savedPredictions");
        if (savedData) {
          const predictions = JSON.parse(savedData);
          if (predictions && predictions.length > 0) {
            setPredictions(predictions);
          }
        }
      } catch (err) {
        setError("Error loading predictions");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

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

  const data = {
    labels: predictions.map((entry) => entry.Date),
    datasets: [
      {
        label: "Predicted Open",
        data: predictions.map((entry) => entry.Predicted_Open),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
      {
        label: "Predicted Close",
        data: predictions.map((entry) => entry.Predicted_Close),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Stock Price Predictions",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/tutorial">Tutorial</Button>
            <Button color="inherit" component={Link} to="/charts">Charts</Button>
            <Button color="inherit" component={Link} to="/predictions">Predictions</Button>
          </Box>

          <IconButton onClick={toggleDarkMode} color="inherit">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Charts Page Content */}
      <Box sx={{ textAlign: "center", padding: 4 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Stock Prediction Charts
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ padding: 3, marginTop: 2, bgcolor: 'error.light' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        ) : predictions.length === 0 ? (
          <Paper sx={{ padding: 3, marginTop: 2 }}>
            <Typography variant="h6" color="secondary">
              No prediction data available. Please make a prediction first.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ padding: 3, marginTop: 2 }}>
              <Typography variant="h6" gutterBottom>
                Stock Price Predictions
              </Typography>
              <Typography variant="body1" gutterBottom>
                This chart shows the predicted open and close prices for the selected stock.
              </Typography>
              <Line data={data} options={options} />
            </Paper>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Charts;