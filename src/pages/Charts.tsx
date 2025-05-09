import React, { useState, useEffect } from "react";
import { Box, Typography, Paper, AppBar, Toolbar, Button, IconButton, CircularProgress } from "@mui/material";
import { Bar } from "react-chartjs-2"; // Changed from Line to Bar
import { Link } from "react-router-dom";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, // Bar chart component
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Prediction {
  Ticker: string;
  Date: string;
  Predicted_Open: number;
  Predicted_Close: number;
}

/*
Charts should compare predicted and actual; however, 
we are running into issues with displaying the actual data.
As a placeholder, we have set the data parameters of those to null so that we can show something.
*/
const Charts: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem("darkMode") === "true");
  const [loading, setLoading] = useState<boolean>(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const savedData = localStorage.getItem("savedPredictions");
        if (savedData) {
          const predictions = JSON.parse(savedData);
          if (predictions.length > 0) {
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

  const openChartData = {
    labels: predictions.map((entry) => entry.Date),
    datasets: [
      {
        label: "Predicted Open (For Predicted Day)",
        data: predictions.map((entry) => entry.Predicted_Open),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
      },
      {
        label: "Actual Open (Previous Day)",
        data: [null, null], //null values due to errors
        backgroundColor: "rgba(255, 165, 0, 0.5)",
        borderColor: "rgb(255, 165, 0)",
        borderWidth: 1,
      },
    ],
  };

  const closeChartData = {
    labels: predictions.map((entry) => entry.Date),
    datasets: [
      {
        label: "Predicted Close (For Predicted Day)",
        data: predictions.map((entry) => entry.Predicted_Close),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 1,
      },
      {
        label: "Actual Close (Previous Day)",
        data: [null, null], //null values due to errors
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgb(54, 162, 235)",
        borderWidth: 1,
      },
    ],
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ padding: 3, marginTop: 2, bgcolor: "error.light" }}>
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
            {/* Predicted Open Prices Bar Chart */}
            <Paper sx={{ padding: 3, marginTop: 2 }}>
              <Typography variant="h6" gutterBottom>Open Prices Comparison</Typography>
              <Bar data={openChartData} />
            </Paper>

            {/* Predicted Close Prices Bar Chart */}
            <Paper sx={{ padding: 3, marginTop: 2 }}>
              <Typography variant="h6" gutterBottom>Close Prices Comparison</Typography>
              <Bar data={closeChartData} />
            </Paper>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Charts;