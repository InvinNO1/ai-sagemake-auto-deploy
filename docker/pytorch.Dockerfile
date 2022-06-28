ARG fs_version

FROM pytorch/pytorch:$fs_version

ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility

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


WORKDIR $work_dir
COPY serve/* ./
COPY model/base model/base
COPY model/$model_id model/btc_ai
RUN chmod 775 serve


# Custom setup
WORKDIR $work_dir/build-config
RUN if [ -f "setup.sh" ]; then sh setup.sh ; fi
WORKDIR $work_dir
RUN rm -rf $work_dir/build-config


ENV PATH="$work_dir:${PATH}"
ENV PYTHONPATH "$work_dir/model/btc_ai:$work_dir/model:${PYTHONPATH}"