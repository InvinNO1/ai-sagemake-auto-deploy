ARG fs_version

FROM tensorflow/tensorflow:$fs_version

RUN apt update
RUN apt install -y nginx ca-certificates
RUN rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=TRUE
RUN pip install --no-cache-dir flask gunicorn


ARG model_id
ENV work_dir '/opt/program'

COPY build-config/$model_id $work_dir/build-config
WORKDIR $work_dir/build-config
RUN pip install --no-cache-dir -r requirements.txt
# Add custom setup


RUN rm -rf $work_dir/build-config


WORKDIR $work_dir
COPY serve/* .
COPY model/base model/base
COPY model/$model_id model/btc_ai
RUN chmod 775 serve


ENV PATH="$work_dir:${PATH}"
ENV PYTHONPATH "$work_dir/model/btc_ai:$work_dir/model:${PYTHONPATH}"