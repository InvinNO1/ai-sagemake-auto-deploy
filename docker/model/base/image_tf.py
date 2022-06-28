import base64

import tensorflow as tf


def base64_jpg_to_tf_tensor(base64_img, channels=3, dct_method='INTEGER_ACCURATE'):
    base64_decode = base64.b64decode(base64_img)
    return tf.image.decode_jpeg(base64_decode, channels=channels, dct_method=dct_method)


def tf_tensor_to_base64_jpg(img, format='rgb', quality=100):
    decode_base64 = tf.image.encode_jpeg(img, format=format, quality=quality)
    return base64.b64encode(decode_base64.numpy()).decode('utf-8')
