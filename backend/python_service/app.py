from flask import Flask, request, jsonify
import pandas as pd
from prophet import Prophet
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/forecast', methods=['POST'])
def forecast():
    # Expect the request body to contain JSON data: [{"ds": "YYYY-MM-DD", "y": value}, ...]
    data = request.json

    # Convert the input data to a pandas DataFrame and exclude the 'isHistorical' field
    df = pd.DataFrame(data)[['ds', 'y']]  # Only keep 'ds' and 'y' columns

    # Initialize the Prophet model
    model = Prophet()
    model.fit(df)

    # Create future dates and generate forecasts (extend by 2 months)
    future = model.make_future_dataframe(periods=60, freq='D')  # Forecast for the next 60 days
    forecast = model.predict(future)

    # Filter the forecast to return only data for January 2025
    forecast_january = forecast[(forecast['ds'] >= '2025-01-01') & (forecast['ds'] < '2025-02-01')]

    # Check if there is any forecast data for January
    if not forecast_january.empty:
        return jsonify(forecast_january[['ds', 'yhat']].to_dict(orient='records'))
    else:
        return jsonify({"message": "No forecast data for January 2025"}), 404

if __name__ == '__main__':
    app.run(port=5000)
