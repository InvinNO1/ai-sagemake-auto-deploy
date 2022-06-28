import base64
import io

import matplotlib.image as mpimg
from PIL import Image

weight_config_path = '/opt/ml/model'


def base64_jpg_to_numpy(base64_img):
    base64_decode = base64.b64decode(base64_img)
    img = mpimg.imread(io.BytesIO(base64_decode), format='JPG')
    return img


def numpy_to_base64_jpg(np_img):
    img = Image.fromarray(np_img)
    buff = io.BytesIO()
    img.save(buff, format="JPEG")
    return base64.b64encode(buff.getvalue()).decode("utf-8")
