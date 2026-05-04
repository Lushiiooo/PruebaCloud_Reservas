FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements_extra.txt .
RUN pip install --no-cache-dir -r requirements_extra.txt

COPY . .

EXPOSE 8000
