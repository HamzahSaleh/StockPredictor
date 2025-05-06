import React, { useState } from "react";
import { Box, Typography, Paper, AppBar, Toolbar, Button, IconButton } from "@mui/material";
import { Link } from "react-router-dom";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";

const Tutorial: React.FC = () => {
  // Dark mode functionality
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

      {/* Tutorial Content */}
      <Box sx={{ textAlign: "center", padding: 4 }}>
        <Typography variant="h4" color="primary">
          Stock Prediction App Tutorial
        </Typography>
        <Paper sx={{ padding: 3, marginTop: 2 }}>
          <Typography variant="h5" gutterBottom>
            📌 What Does This Site Do?
          </Typography>
          <Typography variant="body1">
            This site predicts future stock prices based on historical market data. Using machine learning models trained on past trends, the app provides **predicted opening and closing prices** for selected stocks.
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ marginTop: 3 }}>
            🔍 How to Use the App
          </Typography>
          <Typography variant="body2">
            1️⃣ **Enter a Stock Ticker** (e.g., "AAPL" for Apple, "TSLA" for Tesla).  
            2️⃣ **Select a Date Range** for historical stock data analysis. This must be greater than 60 days!!
            3️⃣ **Click “Train Model”** to run predictions based on the selected stock and date range.  
            4️⃣ **View Results** – See predicted stock prices compared to actual historical values.  
            5️⃣ **Check Confidence Charts** – Analyze prediction accuracy with confidence intervals.  
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ marginTop: 3 }}>
            🚀 Features & Insights
          </Typography>
          <Typography variant="body2">
            ✅ **Real-time Stock Predictions** powered by machine learning models.  
            ✅ **Interactive Charts** comparing actual vs. predicted stock values.  
            ✅ **Data Visualization** for better financial insights.  
            ✅ **Easy Navigation** with quick access to tutorials and confidence charts.  
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ marginTop: 3 }}>
            🔗 Additional Resources
          </Typography>
          <Typography variant="body2">
            - **Charts Page** → View stock data & predictions visually.  
            - **Confidence Charts** → Understand the accuracy of predictions.  
            - **FAQ Section** → Common questions about stock forecasting.  
          </Typography>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Tutorial;