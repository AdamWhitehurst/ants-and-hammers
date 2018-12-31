const tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");
const hiddenUnits = 4096;

module.exports = class DoodleIdentifier {
  constructor() {
    let inputLayer = tf.layers.dense({
      inputShape: [65025],
      units: hiddenUnits,
      name: "in-layer"
    });
    let hiddenLayerOne = tf.layers.dense({
      units: hiddenUnits,
      activation: "sigmoid",
      name: "hidden-one-layer"
    });
    let hiddenLayerTwo = tf.layers.dense({
      units: hiddenUnits,
      activation: "sigmoid",
      name: "hidden-two-layer"
    });
    let outputLayer = tf.layers.dense({
      units: 2,
      activation: "softmax",
      name: "out-layer"
    });

    this.model = tf.sequential();
    this.model.add(inputLayer);
    this.model.add(hiddenLayerOne);
    this.model.add(hiddenLayerTwo);
    this.model.add(outputLayer);

    const sgdOpt = tf.train.sgd(0.2);
    this.model.compile({
      optimizer: sgdOpt,
      loss: "categoricalCrossentropy"
    });

    this.model.summary();
  }

  recieveImageData(dData, labelValue) {
    // Stuff's gonna happen here

    /**
     * Take every fourth value because input
     * image data is 1d, rgba, and greyscale.
     * only need to know if pixel is white or not:
     * data = [
     * ...
     * 24, <-- r, only need one
     * 24, <-- g
     * 24, <-- b
     * 255, <- a
     * 24, <-- next pixel's r
     * ...
     * ]
     */
    this.model
      .fit(
        tf.tensor2d(dData.imageData, [1, dData.imageData.length]),
        tf.oneHot([dData.dType], 2),
        {
          epochs: 1
        }
      )
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.warn(err);
      });
  }
};
