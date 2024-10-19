from flask import Flask, request, jsonify
import pandas as pd
from prophet import Prophet
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json

    if not data or not isinstance(data, list):
        return jsonify({"error": "Invalid data format. Expecting a JSON array."}), 400

    try:
        df = pd.DataFrame(data)[['ds', 'y']]
        model = Prophet()
        model.fit(df)

        future = model.make_future_dataframe(periods=60, freq='D')
        forecast = model.predict(future)

        filtered_forecast = forecast[(forecast['ds'] >= '2025-01-01') & (forecast['ds'] < '2025-02-01')]

        if not filtered_forecast.empty:
            return jsonify(filtered_forecast[['ds', 'yhat']].to_dict(orient='records'))
        else:
            return jsonify({"message": "No forecast data available"}), 404
    except Exception as e:
        print("Error processing forecast:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
