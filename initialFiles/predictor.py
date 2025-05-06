import os
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def make_sequences(data, win=60):
    X, y = [], []
    for i in range(len(data) - win):
        X.append(data[i : i+win])
        y.append(data[i+win, 0])
    return np.array(X), np.array(y)

def main():
    # ←—— Set your parameters here! ——————————————————————
    ticker_symbol = "AAPL"           # e.g. "BRK-B" or "MSFT"
    start_date    = "2015-01-01"     # format YYYY-MM-DD
    end_date      = "2025-03-30"     # format YYYY-MM-DD
    # ————————————————————————————————————————————————————

    print(f"Ticker: {ticker_symbol}, Start: {start_date}, End: {end_date}")

    # 1) Fetch historical data
    df = yf.Ticker(ticker_symbol).history(start=start_date, end=end_date)
    if df.empty:
        raise RuntimeError("No data returned. Check ticker & date range.")

    df.reset_index(inplace=True)
    df.sort_values("Date", inplace=True)

    # 2) Prepare 'Close' prices and scale
    close_prices = df[['Close']].values
    scaler = MinMaxScaler((0,1))
    scaled_close = scaler.fit_transform(close_prices)

    # 3) Build sequences (60-day window)
    WINDOW = 60
    X, y = make_sequences(scaled_close, win=WINDOW)
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    # 4) Define & train LSTM
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(WINDOW, 1)),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(1),
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X_train, y_train, epochs=25, batch_size=32,
              validation_split=0.1, verbose=1)

    # 5) Forecast next business day
    last_window = scaled_close[-WINDOW:].reshape(1, WINDOW, 1)
    pred_scaled = model.predict(last_window, verbose=0)[0][0]
    pred_close  = scaler.inverse_transform([[pred_scaled]])[0][0]

    last_date = df['Date'].iloc[-1]
    next_bday = last_date + pd.tseries.offsets.BDay()

    print(f"\nPredicted CLOSE for {ticker_symbol} on {next_bday.date()}: ${pred_close:.2f}\n")

    # 6) Save to CSV
    out = pd.DataFrame({
        'Ticker': [ticker_symbol],
        'Date':   [next_bday.date()],
        'Predicted_Close': [pred_close]
    })
    path = os.path.join(os.path.dirname(__file__),
                        f"next_day_LSTM_{ticker_symbol}.csv")
    out.to_csv(path, index=False)
    print(f"Saved → {path}")

if __name__ == "__main__":
    main()
