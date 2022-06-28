from flask import Flask, request

from btc_ai import inference

app = Flask(__name__)


@app.route('/ping', methods=['GET'])
def health_check():
    return "OK"


@app.route('/invocations', methods=['POST'])
def invocations() -> dict:
    req_json = request.get_json(force=True)
    return inference.predict(inference.load_input(req_json))

print("POST: http://localhost:8080/invocations")
