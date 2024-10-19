from flask import Flask, request, jsonify
import pandas as pd
from prophet import Prophet
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/forecast', methods=['POST'])
def forecast():
    # Extract forecast type from request (e.g., 'occupancy' or 'event')
    forecast_type = request.args.get('forecastType', 'occupancy')  # Default to 'occupancy'
    data = request.json

    # Convert the input data to a pandas DataFrame
    df = pd.DataFrame(data)[['ds', 'y']]  # Only keep 'ds' and 'y' columns

    # Initialize the Prophet model
    model = Prophet()
    model.fit(df)

    # Create future dates and generate forecasts (extend by 2 months)
    future = model.make_future_dataframe(periods=60, freq='D')  # Forecast for the next 60 days
    forecast = model.predict(future)

    # Determine how to filter the forecast based on type
    if forecast_type == 'occupancy':
        # Example: Only forecast for the next 30 days
        filtered_forecast = forecast[(forecast['ds'] >= '2025-01-01') & (forecast['ds'] < '2025-02-01')]
    elif forecast_type == 'event':
        # Example: Filter to show the forecast for January 2025
        filtered_forecast = forecast[(forecast['ds'] >= '2025-01-01') & (forecast['ds'] < '2025-02-01')]
    else:
        return jsonify({"error": "Invalid forecast type"}), 400

    # Check if there is any forecast data for the desired period
    if not filtered_forecast.empty:
        return jsonify(filtered_forecast[['ds', 'yhat']].to_dict(orient='records'))
    else:
        return jsonify({"message": "No forecast data available"}), 404

if __name__ == '__main__':
    app.run(port=5000)
