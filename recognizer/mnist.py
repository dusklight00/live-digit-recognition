import numpy as np
import keras

class MNIST:
    def __init__(self):
        self.model = keras.models.load_model("scratchmodel.h5")
    
    def predict_digit(self, image):
        image = np.expand_dims(image, axis = -1)
        image = np.array([image])
        return self.model.predict(image)