FROM python:3.10-slim
WORKDIR /backend
COPY backend/requirements.txt ./
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
COPY backend .
EXPOSE 8000
CMD ["gunicorn", "data.api:app", "--bind", "0.0.0.0:8000"]