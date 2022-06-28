import json
import os

from base.image import weight_config_path

weight_path = os.path.join(weight_config_path, 'weight.txt')
config_path = os.path.join(weight_config_path, 'config.json')

with open(config_path, 'r') as f:
    config = json.load(f)

with open(weight_path, 'r') as f:
    weight = f.read()


# TODO init model

def load_input(body):
    # TODO format input
    return body['img']


def predict(img):
    # TODO predict
    img_output = img
    return {
        'config': config,
        'weight': weight,
        'output_img': img_output
    }
