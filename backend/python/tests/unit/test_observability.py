"""Tests for the observability module (middleware, setup, get_logger)."""

from __future__ import annotations

import logging
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import structlog
from starlette.requests import Request
from starlette.responses import Response
from starlette.testclient import TestClient
from starlette.applications import Starlette
from starlette.routing import Route

from src.infrastructure.observability.middleware import RequestLoggingMiddleware
from src.infrastructure.observability.setup import (
    _configure_structlog,
    get_logger,
    instrument_app,
    setup_observability,
    shutdown_observability,
)


def _make_settings(**overrides):
    """Build a minimal Settings mock with observability defaults."""
    defaults = {
        "otel_enabled": False,
        "otel_service_name": "test-service",
        "otel_exporter_otlp_endpoint": "http://localhost:4317",
        "otel_exporter_otlp_insecure": True,
        "otel_log_level": "INFO",
        "app_env": "dev",
    }
    defaults.update(overrides)
    return MagicMock(**defaults)


# ---------------------------------------------------------------------------
# Middleware tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestRequestLoggingMiddleware:
    """Tests for RequestLoggingMiddleware."""

    def _build_app(self) -> Starlette:
        async def homepage(request: Request) -> Response:
            return Response("ok", status_code=200)

        async def error_route(request: Request) -> Response:
            return Response("fail", status_code=500)

        app = Starlette(
            routes=[
                Route("/", homepage),
                Route("/error", error_route),
            ],
        )
        app.add_middleware(RequestLoggingMiddleware)
        return app

    def test_middleware_returns_response(self):
        client = TestClient(self._build_app())
        resp = client.get("/")
        assert resp.status_code == 200
        assert resp.text == "ok"

    def test_middleware_preserves_status_code(self):
        client = TestClient(self._build_app())
        resp = client.get("/error")
        assert resp.status_code == 500

    @patch("src.infrastructure.observability.middleware.logger")
    def test_middleware_logs_request(self, mock_logger):
        client = TestClient(self._build_app())
        client.get("/")

        mock_logger.info.assert_called_once()
        call_kwargs = mock_logger.info.call_args
        assert call_kwargs[0][0] == "request"
        assert call_kwargs[1]["method"] == "GET"
        assert call_kwargs[1]["path"] == "/"
        assert call_kwargs[1]["status"] == 200
        assert "duration_ms" in call_kwargs[1]
        assert isinstance(call_kwargs[1]["duration_ms"], float)

    @patch("src.infrastructure.observability.middleware.logger")
    def test_middleware_logs_correct_method_and_path(self, mock_logger):
        client = TestClient(self._build_app())
        client.get("/error")

        kw = mock_logger.info.call_args[1]
        assert kw["method"] == "GET"
        assert kw["path"] == "/error"
        assert kw["status"] == 500

    @patch("src.infrastructure.observability.middleware.trace")
    @patch("src.infrastructure.observability.middleware.logger")
    def test_middleware_extracts_trace_context(self, mock_logger, mock_trace):
        mock_ctx = MagicMock()
        mock_ctx.trace_id = 0x1234567890ABCDEF1234567890ABCDEF
        mock_ctx.span_id = 0x1234567890ABCDEF
        mock_span = MagicMock()
        mock_span.get_span_context.return_value = mock_ctx
        mock_trace.get_current_span.return_value = mock_span

        client = TestClient(self._build_app())
        client.get("/")

        kw = mock_logger.info.call_args[1]
        assert kw["trace_id"] == format(mock_ctx.trace_id, "032x")

    @patch("src.infrastructure.observability.middleware.trace")
    @patch("src.infrastructure.observability.middleware.logger")
    def test_middleware_handles_no_span(self, mock_logger, mock_trace):
        mock_trace.get_current_span.return_value = None

        client = TestClient(self._build_app())
        client.get("/")

        kw = mock_logger.info.call_args[1]
        assert kw["trace_id"] == ""

    @patch("src.infrastructure.observability.middleware.trace")
    @patch("src.infrastructure.observability.middleware.logger")
    def test_middleware_handles_zero_trace_id(self, mock_logger, mock_trace):
        mock_ctx = MagicMock()
        mock_ctx.trace_id = 0
        mock_ctx.span_id = 0
        mock_span = MagicMock()
        mock_span.get_span_context.return_value = mock_ctx
        mock_trace.get_current_span.return_value = mock_span

        client = TestClient(self._build_app())
        client.get("/")

        kw = mock_logger.info.call_args[1]
        # trace_id 0 is falsy, so should be empty string
        assert kw["trace_id"] == ""


# ---------------------------------------------------------------------------
# setup_observability tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestSetupObservability:
    """Tests for setup_observability and related functions."""

    @patch("src.infrastructure.observability.setup._configure_structlog")
    def test_otel_disabled_only_configures_structlog(self, mock_structlog_cfg):
        settings = _make_settings(otel_enabled=False)
        setup_observability(settings)
        mock_structlog_cfg.assert_called_once_with(settings)

    @patch("src.infrastructure.observability.setup._configure_structlog")
    @patch("src.infrastructure.observability.setup.HTTPXClientInstrumentor")
    @patch("src.infrastructure.observability.setup.SQLAlchemyInstrumentor")
    @patch("src.infrastructure.observability.setup.LoggingInstrumentor")
    @patch("src.infrastructure.observability.setup.OTLPLogExporter")
    @patch("src.infrastructure.observability.setup.OTLPMetricExporter")
    @patch("src.infrastructure.observability.setup.OTLPSpanExporter")
    def test_otel_enabled_sets_up_providers(
        self,
        mock_span_exp,
        mock_metric_exp,
        mock_log_exp,
        mock_logging_inst,
        mock_sqla_inst,
        mock_httpx_inst,
        mock_structlog_cfg,
    ):
        import src.infrastructure.observability.setup as mod

        settings = _make_settings(otel_enabled=True)
        setup_observability(settings)

        assert mod._tracer_provider is not None
        assert mod._meter_provider is not None
        assert mod._logger_provider is not None
        mock_structlog_cfg.assert_called_once_with(settings)

        # Cleanup
        mod._tracer_provider = None
        mod._meter_provider = None
        mod._logger_provider = None

    @patch("src.infrastructure.observability.setup._configure_structlog")
    @patch("src.infrastructure.observability.setup.HTTPXClientInstrumentor")
    @patch("src.infrastructure.observability.setup.SQLAlchemyInstrumentor")
    @patch("src.infrastructure.observability.setup.LoggingInstrumentor")
    @patch("src.infrastructure.observability.setup.OTLPLogExporter")
    @patch("src.infrastructure.observability.setup.OTLPMetricExporter")
    @patch("src.infrastructure.observability.setup.OTLPSpanExporter")
    def test_otel_enabled_instruments_libraries(
        self,
        mock_span_exp,
        mock_metric_exp,
        mock_log_exp,
        mock_logging_inst,
        mock_sqla_inst,
        mock_httpx_inst,
        mock_structlog_cfg,
    ):
        import src.infrastructure.observability.setup as mod

        settings = _make_settings(otel_enabled=True)
        setup_observability(settings)

        mock_logging_inst.return_value.instrument.assert_called_once()
        mock_sqla_inst.return_value.instrument.assert_called_once()
        mock_httpx_inst.return_value.instrument.assert_called_once()

        # Cleanup
        mod._tracer_provider = None
        mod._meter_provider = None
        mod._logger_provider = None


# ---------------------------------------------------------------------------
# shutdown_observability tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestShutdownObservability:
    """Tests for shutdown_observability."""

    def test_shutdown_with_no_providers(self):
        import src.infrastructure.observability.setup as mod

        mod._tracer_provider = None
        mod._meter_provider = None
        mod._logger_provider = None
        # Should not raise
        shutdown_observability()

    def test_shutdown_calls_shutdown_on_providers(self):
        import src.infrastructure.observability.setup as mod

        mock_tracer = MagicMock()
        mock_meter = MagicMock()
        mock_logger = MagicMock()

        mod._tracer_provider = mock_tracer
        mod._meter_provider = mock_meter
        mod._logger_provider = mock_logger

        shutdown_observability()

        mock_tracer.shutdown.assert_called_once()
        mock_meter.shutdown.assert_called_once()
        mock_logger.shutdown.assert_called_once()

        # Cleanup
        mod._tracer_provider = None
        mod._meter_provider = None
        mod._logger_provider = None


# ---------------------------------------------------------------------------
# instrument_app tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestInstrumentApp:
    """Tests for instrument_app."""

    @patch("src.infrastructure.observability.setup.FastAPIInstrumentor")
    def test_instrument_app_calls_fastapi_instrumentor(self, mock_fai):
        app = MagicMock()
        instrument_app(app)
        mock_fai.instrument_app.assert_called_once_with(app)


# ---------------------------------------------------------------------------
# _configure_structlog tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestConfigureStructlog:
    """Tests for _configure_structlog."""

    def test_configures_root_logger_level(self):
        settings = _make_settings(otel_log_level="WARNING")
        _configure_structlog(settings)

        root = logging.getLogger()
        assert root.level == logging.WARNING

    def test_dev_env_uses_console_renderer(self):
        settings = _make_settings(app_env="dev")
        _configure_structlog(settings)

        root = logging.getLogger()
        handler = root.handlers[0]
        formatter = handler.formatter
        assert isinstance(formatter, structlog.stdlib.ProcessorFormatter)

    def test_prod_env_uses_json_renderer(self):
        settings = _make_settings(app_env="production")
        _configure_structlog(settings)

        root = logging.getLogger()
        handler = root.handlers[0]
        formatter = handler.formatter
        assert isinstance(formatter, structlog.stdlib.ProcessorFormatter)

    def test_quiets_uvicorn_access_logger(self):
        settings = _make_settings()
        _configure_structlog(settings)

        uvicorn_logger = logging.getLogger("uvicorn.access")
        assert uvicorn_logger.level == logging.WARNING


# ---------------------------------------------------------------------------
# get_logger tests
# ---------------------------------------------------------------------------

@pytest.mark.unit
class TestGetLogger:
    """Tests for get_logger."""

    def test_returns_bound_logger(self):
        logger = get_logger("test")
        assert logger is not None

    def test_returns_logger_without_name(self):
        logger = get_logger()
        assert logger is not None
