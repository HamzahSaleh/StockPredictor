#include <iostream>
#include <unordered_map>
#include <vector>
#include <string>
#include <iomanip>  // For formatting output

using namespace std;

// Define a structure to hold stock data
struct StockData {
    string date;
    double open;
    double high;
    double low;
    double close;
    double predicted_open;
    double predicted_close;
};

// Function to display data
void displayData(const unordered_map<string, vector<StockData>>& stockMap, const string& stockSymbol) {
    if (stockMap.find(stockSymbol) == stockMap.end()) {
        cout << "Stock symbol not found!\n";
        return;
    }
    
    const vector<StockData>& data = stockMap.at(stockSymbol);
    cout << "Date        | Open   | High   | Low    | Close  | Predicted_Open | Predicted_Close\n";
    cout << "-------------------------------------------------------------------------------------\n";
    for (const auto& entry : data) {
        cout << entry.date << " | " 
             << fixed << setprecision(2)
             << entry.open << " | " 
             << entry.high << " | " 
             << entry.low << " | " 
             << entry.close << " | "
             << entry.predicted_open << " | "
             << entry.predicted_close << "\n";
    }
}

// Function to select stock and date range (mocked here for simplicity)
vector<StockData> filterDataByDate(const vector<StockData>& data, const string& startDate, const string& endDate) {
    vector<StockData> filteredData;
    for (const auto& entry : data) {
        if (entry.date >= startDate && entry.date <= endDate) {
            filteredData.push_back(entry);
        }
    }
    return filteredData;
}

// Mock training function
void trainModel(const vector<StockData>& trainingData) {
    // Placeholder: In real implementation, call Python scripts or use a C++ ML library
    cout << "Training model with " << trainingData.size() << " data points...\n";
    // Output could include model evaluation metrics, etc.
}

int main() {
    // Mock dataset
    unordered_map<string, vector<StockData>> stockMap = {
        {"AAPL", {
            {"2025-03-28", 215.50, 217.00, 214.00, 216.50, 217.80, 218.27},
            {"2025-03-29", 216.50, 218.00, 215.00, 217.50, 218.50, 219.00}
        }},
        {"BRK-B", {
            {"2025-03-28", 312.00, 315.00, 310.00, 314.00, 315.50, 316.00},
            {"2025-03-29", 314.00, 316.00, 313.00, 315.00, 316.50, 317.00}
        }}
    };

    // User input
    string stockSymbol, startDate, endDate;
    cout << "Enter stock symbol (e.g., AAPL): ";
    cin >> stockSymbol;
    cout << "Enter start date (YYYY-MM-DD): ";
    cin >> startDate;
    cout << "Enter end date (YYYY-MM-DD): ";
    cin >> endDate;

    // Filter data by date range
    if (stockMap.find(stockSymbol) != stockMap.end()) {
        vector<StockData> filteredData = filterDataByDate(stockMap[stockSymbol], startDate, endDate);
        trainModel(filteredData);  // Train model on filtered data
        displayData(stockMap, stockSymbol);  // Display full stock data
    } else {
        cout << "Stock symbol not found in the dataset.\n";
    }

    return 0;
}
