from flask import Flask, Response, render_template, request
import numpy as np
from recognizer.mnist import MNIST
import json

app = Flask(
    __name__,
    template_folder = "static"    
)

def normalize(image_data):
    normalized_image_data = []
    for y in image_data:
        image_row = []
        for x in y:
            image_row.append(x / 255.0)
        normalized_image_data.append(image_row)

    return normalized_image_data

def rearrange_image_data(image):
    image_array = np.array([])
    for pixel in image.values():
        image_array = np.append(image_array, pixel)

    grey_image_array = np.array([])
    for i in range(0, len(image_array), 4):
        r = image_array[i]
        g = image_array[i + 1]
        b = image_array[i + 2]
        a = image_array[i + 3]

        grey_pixel = a
        grey_image_array = np.append(grey_image_array, grey_pixel)

    grey_image_array = grey_image_array.reshape(28, 28)

    return grey_image_array

@app.route('/')
def interface():
    return render_template("interface.html")

@app.route('/predict_digit', methods = ["POST"])
def predict_digit():
    mnist = MNIST()
    
    image_data = json.loads(request.form["image_data"])
    image_data = rearrange_image_data(image_data)
    image_data = normalize(image_data)

    results = mnist.predict_digit(image_data).tolist()

    json_response = json.dumps({
        "results": json.dumps(results)
    })

    return Response(json_response, mimetype = "text/json")

if __name__ == "__main__":
    app.run(debug = True)