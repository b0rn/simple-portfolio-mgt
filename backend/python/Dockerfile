FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --target=/deps -r requirements.txt

FROM python:3.12-slim

LABEL org.opencontainers.image.source="https://github.com/simple-portfolio-mgt" \
      org.opencontainers.image.description="Python backend for Simple Portfolio Management"

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd -r appuser && \
    useradd -r -g appuser -d /app -s /sbin/nologin appuser

WORKDIR /app

COPY --from=builder /deps /usr/local/lib/python3.12/site-packages
COPY --from=builder /deps/bin/* /usr/local/bin/
COPY src/ src/

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:80/health')" || exit 1

CMD ["uvicorn", "src.infrastructure.cmd.api:app", "--host", "0.0.0.0", "--port", "80"]
