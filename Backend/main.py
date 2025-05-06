from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "FastAPI backend is running!"}

# Define API request format for stock predictions
class StockRequest(BaseModel):
    ticker: str
    start_date: str
    end_date: str

# Helper function for LSTM sequences
def make_sequences(data, win=60):
    try:
        X, y = [], []
        for i in range(len(data) - win):
            X.append(data[i : i+win])
            y.append(data[i+win, 0])
        return np.array(X), np.array(y)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating sequences: {str(e)}")

# Train Model & Predict Stock Prices
@app.post("/predict")
def predict_stock_price(request: StockRequest):
    ticker_symbol = request.ticker
    start_date = request.start_date
    end_date = request.end_date

    print(f"📊 Fetching stock data for {ticker_symbol} from {start_date} to {end_date}...")  # Debugging

    # Fetch stock data from Yahoo Finance
    try:
        df = yf.Ticker(ticker_symbol).history(start=start_date, end=end_date)
        if df.empty:
            print(" No stock data found!")  # Debugging
            raise HTTPException(status_code=400, detail="No stock data found. Check the ticker symbol or date range.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")

    # Preprocess stock data
    try:
        df.reset_index(inplace=True)
        df.sort_values("Date", inplace=True)
        close_prices = df[['Close']].values
        open_prices = df[['Open']].values
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_close = scaler.fit_transform(close_prices)
        scaled_open = scaler.fit_transform(open_prices)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing stock data: {str(e)}")

    # Create sequences for LSTM
    WINDOW = 60
    try:
        X, y_close = make_sequences(scaled_close, win=WINDOW)
        _, y_open = make_sequences(scaled_open, win=WINDOW)
    except HTTPException as e:
        raise e

    if len(X) < WINDOW:
        print(" Not enough stock data for model training.")  # debugging
        raise HTTPException(status_code=400, detail="Not enough stock data for model training. Try a longer date range.")

    # Splitting Data
    TRAIN_SPLIT = int(len(X) * 0.8)
    X_train, X_test = X[:TRAIN_SPLIT], X[TRAIN_SPLIT:]
    y_close_train, y_close_test = y_close[:TRAIN_SPLIT], y_close[TRAIN_SPLIT:]
    y_open_train, y_open_test = y_open[:TRAIN_SPLIT], y_open[TRAIN_SPLIT:]

    # Train LSTM Model
    try:
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(WINDOW, 1)),
            Dropout(0.2),
            LSTM(32),
            Dropout(0.2),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse')
        model.fit(X_train, y_close_train, epochs=25, batch_size=32, validation_split=0.1, verbose=0)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

    # Predict next Open & Close prices
    try:
        last_window_scaled = scaled_close[-WINDOW:].reshape(1, WINDOW, 1)
        next_close_scaled = model.predict(last_window_scaled, verbose=0)[0][0]
        next_close = scaler.inverse_transform([[next_close_scaled]])[0][0]

        last_window_scaled_open = scaled_open[-WINDOW:].reshape(1, WINDOW, 1)
        next_open_scaled = model.predict(last_window_scaled_open, verbose=0)[0][0]
        next_open = scaler.inverse_transform([[next_open_scaled]])[0][0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making predictions: {str(e)}")

    # Determine next trading day
    last_date = df['Date'].iloc[-1]
    tomorrow = last_date + pd.tseries.offsets.BDay()

    # Save Prediction to CSV
    try:
        out_df = pd.DataFrame({
            'Ticker': [ticker_symbol],
            'Date': [tomorrow.date()],
            'Predicted_Open': [next_open],
            'Predicted_Close': [next_close]
        })
        csv_path = os.path.join(os.path.dirname(__file__), f"next_day_LSTM_{ticker_symbol}.csv")
        out_df.to_csv(csv_path, index=False)

        print(f" Prediction saved: {csv_path}")  # Debugging

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving prediction to CSV: {str(e)}")

    return {
        "message": f"Prediction saved successfully at {csv_path}",
        "ticker": ticker_symbol,
        "date": str(tomorrow.date()),
        "predicted_open": round(next_open, 2),
        "predicted_close": round(next_close, 2)
    }

# Fetch Predictions from CSV
@app.get("/fetch_predictions/{ticker}")
def fetch_predictions(ticker: str):
    csv_path = os.path.join(os.path.dirname(__file__), f"next_day_LSTM_{ticker}.csv")

    try:
        if not os.path.exists(csv_path):
            print(f" No prediction file found for {ticker}")  # Debugging
            return []

        df = pd.read_csv(csv_path)

        required_columns = ["Ticker", "Date", "Predicted_Open", "Predicted_Close"]
        missing_cols = [col for col in required_columns if col not in df.columns]

        if missing_cols:
            print(f" CSV missing columns: {missing_cols}")  # Debugging
            raise HTTPException(status_code=500, detail=f"CSV file missing required columns: {missing_cols}")

        response_data = df.fillna(0).to_dict(orient="records")
        print(" FastAPI Response:", response_data)  # Debugging
        return response_data

    except Exception as e:
        print(f" Error reading CSV: {str(e)}")  # Debugging
        raise HTTPException(status_code=500, detail=f"Error reading prediction CSV: {str(e)}")