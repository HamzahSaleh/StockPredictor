import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

const Predictions: React.FC = () => {
  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem("darkMode") === "true");

  // Toggle Dark Mode & Store Preference
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev ? "true" : "false");
      return !prev;
    });
  };

  // Prevent Unnecessary Re-Renders
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: { main: "#1976D2" },
          secondary: { main: "#FF5722" },
        },
        typography: { fontFamily: "'Roboto', 'Arial', sans-serif" },
      }),
    [darkMode]
  );

  // Load Saved Predictions from Local Storage
  const [storedPredictions, setStoredPredictions] = useState<any[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem("savedPredictions");
    if (savedData) {
      setStoredPredictions(JSON.parse(savedData)); // Retrieve saved predictions
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Navigation Bar with Dark Mode Toggle */}
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

      {/* Predictions Page Content */}
      <Box sx={{ textAlign: "center", padding: 4, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom color="primary">
          Stored Predictions
        </Typography>

        {storedPredictions.length > 0 ? (
          <TableContainer component={Paper} elevation={4}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Ticker</strong></TableCell>
                  <TableCell><strong>Predicted Open</strong></TableCell>
                  <TableCell><strong>Predicted Close</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {storedPredictions.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.Date}</TableCell>
                    <TableCell>{entry.Ticker}</TableCell>
                    <TableCell>${entry.Predicted_Open.toFixed(2)}</TableCell>
                    <TableCell>${entry.Predicted_Close.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="h6" color="secondary">No saved predictions yet.</Typography>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default Predictions;