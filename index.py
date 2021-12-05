from flask import Flask, Response, render_template, request
from recognizer.mnist import MNIST
import json

app = Flask(
    __name__,
    template_folder = "static"    
)

@app.route('/')
def interface():
    return render_template("interface.html")

@app.route('/predict_digit', methods = ["POST"])
def predict_digit():
    mnist = MNIST()
    
    image_data = request.form["image_data"] / 255.0
    image_data = np.expand_dims(image_data, axis = -1)
    image_data = np.array([image_data])

    results = mnist.predict(image_data).tolist()

    json_response = json.dumps({
        "results": json.dumps(results)
    })

    return Response(json_response, mimetype = "text/json")

if __name__ == "__main__":
    app.run(debug = True)