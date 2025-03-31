import sys
import datetime
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.linear_model import LinearRegression
import os
def main():
   
    #input like this python path stock_ticker start_date end_date
    #ex: 
    #python predict_next_day.py AAPL 2015-01-01 2025-03-30
    # if no arguments this is the default 
    # ticker_symbol="BRK-B", start_date="2015-01-01", end_date="2025-03-30".
   
    
    # ----- 1. Parse args or set defaults -----
    if len(sys.argv) > 1:
        ticker_symbol = sys.argv[1]
    else:
        ticker_symbol = "BRK-B"
    
    if len(sys.argv) > 2:
        start_date = sys.argv[2]
    else:
        start_date = "2015-01-01"
    
    if len(sys.argv) > 3:
        end_date = sys.argv[3]
    else:
        # You could set this dusing system time
        # end_date = datetime.date.today().strftime("%Y-%m-%d")
        end_date = "2025-03-30"
    
    print(f"Ticker: {ticker_symbol}, Start: {start_date}, End: {end_date}")
    
    # pull the data
    # maybe add a fail safe for weekends right now it will just predict the next day with wrong date
    df = yf.Ticker(ticker_symbol).history(start=start_date, end=end_date)
    if df.empty:
        print("No data returned. Check ticker and date range.")
        return

    # Move 'Date' from index to a column
    df.reset_index(inplace=True)
    df.sort_values("Date", inplace=True)
    
    # create columns for the next day for each of the features
    df["Open_Tomorrow"] = df["Open"].shift(-1)
    df["Close_Tomorrow"] = df["Close"].shift(-1)
    
    train_df = df.dropna().copy()    # We drop the last row because it has no 'tomorrow' values.
    today_row = df.iloc[-1]
    
    # If the last row is from end_date (e.g., "2025-03-30"), we expect tomorrow to be "2025-03-31"
    # This row will have Open, High, Low, Close, Volume for 3/30, but no tomorrow columns.
    
 #training 
    features = ["Open", "High", "Low", "Close", "Volume"]
    
    # Targets
    X = train_df[features]
    y_open = train_df["Open_Tomorrow"]
    y_close = train_df["Close_Tomorrow"]
    
    open_model = LinearRegression()
    close_model = LinearRegression()
    
    open_model.fit(X, y_open)
    close_model.fit(X, y_close)
    
    # make today a single row dataframe to predict the next day
    today_features = pd.DataFrame([[
        today_row["Open"],
        today_row["High"],
        today_row["Low"],
        today_row["Close"],
        today_row["Volume"]
    ]], columns=features)
    
    predicted_open = open_model.predict(today_features)[0]
    predicted_close = close_model.predict(today_features)[0]
    
    # print result with tomorrow's date is last_row_date + 1 day
    last_date = today_row["Date"]
    if isinstance(last_date, pd.Timestamp):
        tomorrow_date = last_date + pd.Timedelta(days=1)
    else:
        # if pd.Timestamp is not used, convert to datetime
        tomorrow_date = pd.to_datetime(last_date) + pd.Timedelta(days=1)
    
    # Print
    print("\n-----------------------------------")
    print(f"Predicted for {ticker_symbol} on {tomorrow_date.date()}:")
    print(f"  Open : ${predicted_open:.2f}")
    print(f"  Close: ${predicted_close:.2f}")
    print("-----------------------------------\n")
    
    # save to csv to be used on user side 
    results_df = pd.DataFrame({
        "Ticker": [ticker_symbol],
        "Date": [tomorrow_date.date()],
        "Predicted_Open": [predicted_open],
        "Predicted_Close": [predicted_close]
    })
    script_dir = os.path.dirname(os.path.abspath(__file__))  # directory for folder so that csv file is saved there
    csv_file = os.path.join(script_dir, f"next_day_prediction_{ticker_symbol}.csv")
    results_df.to_csv(csv_file, index=False)
    print(f"Prediction saved to {csv_file}")

if __name__ == "__main__":
    main()
