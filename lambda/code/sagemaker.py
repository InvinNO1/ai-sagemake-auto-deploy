import os

import boto3
from functools import wraps

runtime = boto3.client('runtime.sagemaker')


def cors_headers(handler_or_origin=None, origin=None, credentials=False):
    if isinstance(handler_or_origin, str) and origin is not None:
        raise TypeError(
            "You cannot include any positonal arguments when using"
            " the `origin` keyword argument"
        )
    if isinstance(handler_or_origin, str) or origin is not None:

        def wrapper_wrapper(handler):
            @wraps(handler)
            def wrapper(event, context):
                response = handler(event, context)
                if response is None:
                    response = {}
                headers = response.setdefault("headers", {})
                if origin is not None:
                    headers["Access-Control-Allow-Origin"] = origin
                else:
                    headers["Access-Control-Allow-Origin"] = handler_or_origin
                if credentials:
                    headers["Access-Control-Allow-Credentials"] = True
                return response

            return wrapper

        return wrapper_wrapper
    elif handler_or_origin is None:
        return cors_headers("*", credentials=credentials)
    else:
        return cors_headers("*")(handler_or_origin)


@cors_headers
def handler(event, context):
    ENDPOINT_NAME = os.getenv('ENDPOINT_NAME')
    body = event.get('body')
    resp = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME, ContentType='application/json', Body=body)

    result = resp['Body'].read().decode('utf-8')

    return {
        'statusCode': 200,
        'body': result
    }
