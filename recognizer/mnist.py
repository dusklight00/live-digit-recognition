import tflite_runtime.interpreter as tflite
import numpy as np

class MNIST:
    def __init__(self):
        self.interpreter = tflite.Interpreter(model_path = "mnist_model.tflite")
        self.interpreter.allocate_tensors()

    def predict_digit(self, image):
        image = np.expand_dims(image, axis=-1)

        input_details = self.interpreter.get_input_details()
        output_details = self.interpreter.get_output_details()

        self.interpreter.set_tensor(input_details[0]["index"], np.array([image], dtype=np.float32))
        self.interpreter.invoke()
        results = self.interpreter.get_tensor(output_details[0]["index"])

        return results