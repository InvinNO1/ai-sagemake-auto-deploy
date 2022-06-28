import json
import os

from base.image import weight_config_path
from base.image_tf import base64_jpg_to_tf_tensor, tf_tensor_to_base64_jpg

weight_path = os.path.join(weight_config_path, 'weight.txt')
config_path = os.path.join(weight_config_path, 'config.json')

with open(config_path, 'r') as f:
    config = json.load(f)

with open(weight_path, 'r') as f:
    weight = f.read()


# TODO init model

def load_input(body):
    # TODO format input
    return base64_jpg_to_tf_tensor(body['img'])


def predict(img):
    # TODO predict
    img_output = img
    base64_output = tf_tensor_to_base64_jpg(img_output)
    output = tf_tensor_to_base64_jpg(base64_jpg_to_tf_tensor(base64_output))
    return {
        'config': config,
        'weight': weight,
        'output_img': output
    }
