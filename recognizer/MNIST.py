import tensorflow as tf
import numpy as np
import keras

class MNIST:
    def __init__(self):
        self.model = keras.models.load_model("mnist_model.h5")
    
    def predict(self, image):
        image = np.expand_dims(image, axis = -1)
        image = np.array([image])
        return self.model.predict(image)

    def train_model(self):
        (x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
        (x_train, x_test) = (x_train / 255.0), (x_test / 255.0)

        x_train, x_test = np.expand_dims(x_train, axis = -1), np.expand_dims(x_test, axis = -1)

        num_classes = 10
        y_train = keras.utils.np_utils.to_categorical(y_train, num_classes)
        y_test = keras.utils.np_utils.to_categorical(y_test, num_classes)

        input_shape = (28, 28, 1)
        train_model = keras.Sequential([
                                
            keras.Input(shape=input_shape),
            layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
            layers.MaxPooling2D(pool_size=(2, 2)),
            layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
            layers.MaxPooling2D(pool_size=(2, 2)),
            layers.Flatten(),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation="softmax"),

        ])
        train_model.summary()

        batch_size = 128
        epochs = 15

        train_model.compile(loss="categorical_crossentropy", optimizer="adam", metrics=["accuracy"])
        train_model.fit(x_train, y_train, batch_size=batch_size, epochs=epochs, validation_split=0.1)

        train_model.save("mnist_model.h5")