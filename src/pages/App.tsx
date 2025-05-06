//Imports
import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AppBar, Toolbar, Button, Box, TextField, Typography, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Card, CardContent, ThemeProvider, createTheme, CssBaseline,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

//App function (home page)
const App: React.FC = () => {
  //Dark mode functionality: this allows for the mode to be retained across page changes
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem("darkMode") === "true");
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev ? "true" : "false");
      return !prev;
    });
  };
  const theme = useMemo(() => createTheme({ palette: { mode: darkMode ? "dark" : "light" } }), [darkMode]);

  //initializing my states
  const [stockTicker, setStockTicker] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [trainingComplete, setTrainingComplete] = useState<boolean>(false);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [showPredictions, setShowPredictions] = useState<boolean>(false);

  // Train Model function: Call FastAPI Backend
  const startTraining = async () => {
    if (!stockTicker || !startDate || !endDate) {
      alert("Please fill out all fields before training the model.");
      return;
    }
  
    setLoading(true);  // Start the loading animation
    setTrainingComplete(false);
  
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker: stockTicker, start_date: startDate, end_date: endDate }),
      });
  
      const data = await response.json();
      console.log(" FastAPI Training Response:", JSON.stringify(data, null, 2));
  
      if (!response.ok) throw new Error(data.detail || "Training failed.");
      setFilteredResults([data]);
      setTrainingComplete(true);
    } catch (error) {
      console.error(" Error training model:", error);
      alert(`Error: ${"Failed to communicate with FastAPI"}`);
    }
  
    setLoading(false);  // Stop the loading animation after training
  };
  

  // Fetch Predictions: Handle API Response Format Safely
  const fetchPredictions = async () => {
    try {
      const response = await fetch(`http://localhost:8000/fetch_predictions/${stockTicker}`);
      const rawData = await response.json();

      console.log("📦 Raw API Response:", JSON.stringify(rawData, null, 2)); // Debugging step

      // Check if FastAPI returned an array or an object
      const data = Array.isArray(rawData) ? rawData : rawData.value;

      console.log(" Extracted Predictions:", JSON.stringify(data, null, 2)); // Debugging step

      if (!response.ok || !data) throw new Error("Failed to fetch predictions.");
      setFilteredResults(data);
    } catch (error) {
      console.error(" Error fetching predictions:", error);
      alert("Failed to load predictions. Check console for details.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/*Nav Bar*/}
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

   {/* Put in stock information + loading bar*/}
      <Box sx={{ textAlign: "center", padding: 4, minHeight: "100vh" }}>
        <Typography variant="h4" gutterBottom color="primary">Stock Prediction App</Typography>
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ width: "100%", gap: 2 }}>
          <Box sx={{ width: "50%" }}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" color="primary">Enter Stock Details</Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField label="Stock Ticker" variant="outlined"
                    value={stockTicker} onChange={(e) => setStockTicker(e.target.value)} />
                  <Box display="flex" gap={2}>
                    <TextField label="Start Date" type="date" value={startDate}
                      onChange={(e) => setStartDate(e.target.value)} fullWidth />
                    <TextField label="End Date" type="date" value={endDate}
                      onChange={(e) => setEndDate(e.target.value)} fullWidth />
                  </Box>
                  <Button variant="contained" color="primary" onClick={startTraining} disabled={loading}>
                    {loading ? "Training in Progress..." : "Train Model"}
                  </Button>
                  {loading && <CircularProgress sx={{ mt: 2 }} />}  {/* Show spinner */}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

 {/*Training complete, store prediction, show prediction*/}
        {trainingComplete && (
  <Card elevation={4} sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
    <CardContent>
      <Typography variant="h6">Training Complete!</Typography>
      <Box display="flex" justifyContent="center" gap={2}>
        <Button variant="contained" color="primary" onClick={() => { 
          setShowPredictions(true); 
          fetchPredictions();  // Fetch predictions when button is clicked
        }}>
          Show Predictions
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => {
          setStockTicker("");
          setStartDate("");
          setEndDate("");
          setFilteredResults([]);
          setTrainingComplete(false);
          setShowPredictions(false);  // Reset predictions view
        }}>
          Reset
        </Button>
      </Box>

      {showPredictions && filteredResults.length > 0 && (  // Only display if requested
        <Box mt={4}>
          <Typography variant="h6" color="secondary">Stock Predictions</Typography>
          <TableContainer component={Paper} elevation={4}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Predicted Open</strong></TableCell>
                  <TableCell><strong>Predicted Close</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredResults.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.Date}</TableCell>
                    <TableCell>${entry?.Predicted_Open ? entry.Predicted_Open.toFixed(2) : ""}</TableCell>
                    <TableCell>${entry?.Predicted_Close ? entry.Predicted_Close.toFixed(2) : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {showPredictions && (
        <Button
        variant="contained"
        color="primary"
        onClick={() => {
          // Retrieve previous saved predictions from localStorage
          const savedData = localStorage.getItem("savedPredictions");
          const previousPredictions = savedData ? JSON.parse(savedData) : [];
      
          // Append the new predictions to the existing saved predictions
          const updatedPredictions = [...previousPredictions, ...filteredResults];
          localStorage.setItem("savedPredictions", JSON.stringify(updatedPredictions));
      
          alert("Predictions saved successfully!");  // Notify user
        }}
      >
        Save Prediction
      </Button>
      )}
    </CardContent>
  </Card>
)}
      </Box>
    </ThemeProvider>
  );
};

export default App;