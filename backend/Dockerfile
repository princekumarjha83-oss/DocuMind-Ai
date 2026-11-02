# DocuMind AI Backend Container
FROM python:3.11-slim

# Install system dependencies for OCR and document processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source and Alembic migrations
COPY . /app/

# Create non-root system user and storage directories
RUN useradd -m -u 1001 documind && \
    mkdir -p /app/storage/uploads && \
    chown -R documind:documind /app

USER documind

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

