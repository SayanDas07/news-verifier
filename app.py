import os
from flask import Flask, request, jsonify
import pickle
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://news-verifier-kappa.vercel.app"])

loaded_model = pickle.load(open('trained_model.sav', 'rb'))
vectorizer = pickle.load(open('vectorizer.sav', 'rb'))
accuracy = pickle.load(open('accuracy.sav', 'rb'))
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Fake News Detection API is running!"})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = data["text"]
    text_transformed = vectorizer.transform([text])
    prediction = loaded_model.predict(text_transformed)[0]
    return jsonify({"prediction": int(prediction)})

@app.route("/accuracy", methods=["GET"])
def get_accuracy():
    return jsonify({"accuracy": float(accuracy)})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7000))  
    app.run(host="0.0.0.0", port=port, debug=False)




