type HttpMetricKey = `${string} ${string} ${number}`;

type HttpMetricInput = {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
};

const httpRequests = new Map<HttpMetricKey, number>();
const httpDurationMs = new Map<HttpMetricKey, number>();
const authFailures = new Map<string, number>();
let totalRequests = 0;
let totalErrors = 0;

const increment = <TKey>(map: Map<TKey, number>, key: TKey, amount = 1) => {
  map.set(key, (map.get(key) || 0) + amount);
};

const metricKey = ({ method, route, statusCode }: HttpMetricInput): HttpMetricKey =>
  `${method.toUpperCase()} ${route} ${statusCode}`;

const escapeLabel = (value: string) => value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export const recordHttpRequest = (input: HttpMetricInput) => {
  const key = metricKey(input);
  totalRequests += 1;
  increment(httpRequests, key);
  increment(httpDurationMs, key, input.durationMs);

  if (input.statusCode >= 500) {
    totalErrors += 1;
  }
};

export const recordAuthFailure = (reason: string) => {
  increment(authFailures, reason);
};

export const renderPrometheusMetrics = () => {
  const lines: string[] = [
    '# HELP clinicpro_http_requests_total Total HTTP requests handled by ClinicPRO.',
    '# TYPE clinicpro_http_requests_total counter',
  ];

  for (const [key, count] of httpRequests.entries()) {
    const [method, route, statusCode] = key.split(' ');
    lines.push(
      `clinicpro_http_requests_total{method="${method}",route="${escapeLabel(route)}",status_code="${statusCode}"} ${count}`,
    );
  }

  lines.push(
    '# HELP clinicpro_http_errors_total Total HTTP 5xx responses handled by ClinicPRO.',
    '# TYPE clinicpro_http_errors_total counter',
    `clinicpro_http_errors_total ${totalErrors}`,
    '# HELP clinicpro_http_request_duration_ms_sum Sum of HTTP request duration in milliseconds.',
    '# TYPE clinicpro_http_request_duration_ms_sum counter',
  );

  for (const [key, durationMs] of httpDurationMs.entries()) {
    const [method, route, statusCode] = key.split(' ');
    lines.push(
      `clinicpro_http_request_duration_ms_sum{method="${method}",route="${escapeLabel(route)}",status_code="${statusCode}"} ${durationMs.toFixed(3)}`,
    );
  }

  lines.push(
    '# HELP clinicpro_http_request_duration_ms_count Count of HTTP request durations.',
    '# TYPE clinicpro_http_request_duration_ms_count counter',
  );

  for (const [key, count] of httpRequests.entries()) {
    const [method, route, statusCode] = key.split(' ');
    lines.push(
      `clinicpro_http_request_duration_ms_count{method="${method}",route="${escapeLabel(route)}",status_code="${statusCode}"} ${count}`,
    );
  }

  lines.push(
    '# HELP clinicpro_auth_failures_total Authentication or authorization failures grouped by reason.',
    '# TYPE clinicpro_auth_failures_total counter',
  );

  for (const [reason, count] of authFailures.entries()) {
    lines.push(`clinicpro_auth_failures_total{reason="${escapeLabel(reason)}"} ${count}`);
  }

  lines.push(
    '# HELP clinicpro_process_uptime_seconds Node.js process uptime in seconds.',
    '# TYPE clinicpro_process_uptime_seconds gauge',
    `clinicpro_process_uptime_seconds ${process.uptime().toFixed(3)}`,
    '# HELP clinicpro_http_requests_in_memory_total Total requests counted in memory.',
    '# TYPE clinicpro_http_requests_in_memory_total counter',
    `clinicpro_http_requests_in_memory_total ${totalRequests}`,
  );

  return `${lines.join('\n')}\n`;
};
