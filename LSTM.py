import sys, os, datetime
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

# ------------ helper: build sliding-window sequences -------------
def make_sequences(data, win=60):
    """
    data : 2-D NumPy array (rows = days, cols = features)
    win  : look-back window length
    returns X (samples, win, features) , y (samples,)
    """
    X, y = [], []
    for i in range(len(data) - win):
        X.append(data[i : i+win])
        y.append(data[i+win, 0])            # 0 = Close column after scaling
    return np.array(X), np.array(y)

# ----------------------------- main ------------------------------
def main():
    # ---- 1. CLI args or defaults ---- 
    ticker_symbol = sys.argv[1] if len(sys.argv) > 1 else "BRK-B"
    start_date    = sys.argv[2] if len(sys.argv) > 2 else "2015-01-01"
    end_date      = sys.argv[3] if len(sys.argv) > 3 else "2025-03-30"

    print(f"Ticker: {ticker_symbol}, Start: {start_date}, End: {end_date}")

    # ---- 2. Fetch data ----
    df = yf.Ticker(ticker_symbol).history(start=start_date, end=end_date)
    if df.empty:
        print("No data returned.  Check ticker and date range.");  return

    df.reset_index(inplace=True)
    df.sort_values("Date", inplace=True)

    # We’ll only model 'Close' for simplicity; add more columns if desired
    close_prices = df[['Close']].values      # shape (N, 1)

    # ---- 3. Scale & window the data ----
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_close = scaler.fit_transform(close_prices)

    # look-back window = 60 trading days (~3 months)
    WINDOW = 60
    X, y = make_sequences(scaled_close, win=WINDOW)
    TRAIN_SPLIT = int(len(X) * 0.8)

    X_train, X_test = X[:TRAIN_SPLIT], X[TRAIN_SPLIT:]
    y_train, y_test = y[:TRAIN_SPLIT], y[TRAIN_SPLIT:]

    # ---- 4. Build & train LSTM ----
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(WINDOW, 1)),
        Dropout(0.2),
        LSTM(32),
        Dropout(0.2),
        Dense(1)                 # next-day Close (scaled)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X_train, y_train,
              epochs=25, batch_size=32,
              validation_split=0.1,
              verbose=0)

    # ---- 5. Predict the NEXT trading day ----
    last_window_scaled = scaled_close[-WINDOW:]           # most recent 60 days
    last_window_scaled = last_window_scaled.reshape(1, WINDOW, 1)
    next_close_scaled  = model.predict(last_window_scaled, verbose=0)[0][0]
    next_close         = scaler.inverse_transform([[next_close_scaled]])[0][0]

    # Determine “tomorrow” date (skip weekends automatically)
    last_date = df['Date'].iloc[-1]
    tomorrow  = last_date + pd.tseries.offsets.BDay()     # next business day

    print("\n-----------------------------------")
    print(f"Predicted CLOSE for {ticker_symbol} on {tomorrow.date()}:")
    print(f"  ${next_close:,.2f}")
    print("-----------------------------------\n")

    # ---- 6. Save csv ----
    out_df = pd.DataFrame({
        'Ticker'        : [ticker_symbol],
        'Date'          : [tomorrow.date()],
        'Predicted_Close': [next_close]
    })
    csv_path = os.path.join(os.path.dirname(__file__),
                            f"next_day_LSTM_{ticker_symbol}.csv")
    out_df.to_csv(csv_path, index=False)
    print(f"Prediction saved to {csv_path}")

if __name__ == "__main__":
    main()
