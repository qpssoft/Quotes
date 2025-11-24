// K6 Baseline Performance Test
// Purpose: Establish baseline metrics with minimal load
// Target: Understand system behavior with low concurrent users

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const quotesResponseTime = new Trend('quotes_response_time');
const authResponseTime = new Trend('auth_response_time');

// Test configuration - Baseline (low load)
export const options = {
  stages: [
    { duration: '30s', target: 10 },  // Ramp up to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    errors: ['rate<0.01'],            // Error rate under 1%
    http_req_failed: ['rate<0.01'],   // Request failure rate under 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:7071';

export default function () {
  // Test 1: Health check endpoint
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health check is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  });
  errorRate.add(healthRes.status !== 200);
  sleep(1);

  // Test 2: Get all quotes (public endpoint)
  const quotesStart = Date.now();
  const quotesRes = http.get(`${BASE_URL}/api/quotes`);
  quotesResponseTime.add(Date.now() - quotesStart);
  
  check(quotesRes, {
    'get quotes is 200': (r) => r.status === 200,
    'quotes response has data': (r) => r.json() && Array.isArray(r.json()),
    'quotes response time < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(quotesRes.status !== 200);
  sleep(1);

  // Test 3: Get quotes by category
  const categoryRes = http.get(`${BASE_URL}/api/quotes?category=wisdom`);
  check(categoryRes, {
    'category filter works': (r) => r.status === 200,
  });
  errorRate.add(categoryRes.status !== 200);
  sleep(1);

  // Test 4: Get quotes by language
  const languageRes = http.get(`${BASE_URL}/api/quotes?language=vi`);
  check(languageRes, {
    'language filter works': (r) => r.status === 200,
  });
  errorRate.add(languageRes.status !== 200);
  sleep(1);

  // Test 5: Get quote by ID (use ID from first quote if available)
  if (quotesRes.status === 200) {
    const quotes = quotesRes.json();
    if (quotes && quotes.length > 0) {
      const firstQuoteId = quotes[0].Id;
      const quoteByIdRes = http.get(`${BASE_URL}/api/quotes/${firstQuoteId}`);
      check(quoteByIdRes, {
        'get quote by ID is 200': (r) => r.status === 200,
        'quote by ID response time < 200ms': (r) => r.timings.duration < 200,
      });
      errorRate.add(quoteByIdRes.status !== 200);
    }
  }
  sleep(2);
}

export function handleSummary(data) {
  return {
    'baseline-results.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: '  ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options?.indent || '';
  const enableColors = options?.enableColors || false;
  
  let summary = '\n' + indent + '========== Baseline Test Summary ==========\n\n';
  
  // Test run info
  summary += indent + `Test Duration: ${data.state.testRunDurationMs / 1000}s\n`;
  summary += indent + `VUs: ${data.metrics.vus?.values.value || 'N/A'}\n`;
  summary += indent + `Iterations: ${data.metrics.iterations?.values.count || 'N/A'}\n\n`;
  
  // HTTP metrics
  summary += indent + 'HTTP Metrics:\n';
  summary += indent + `  Requests: ${data.metrics.http_reqs?.values.count || 'N/A'}\n`;
  summary += indent + `  Failed: ${data.metrics.http_req_failed?.values.rate || 0}\n`;
  summary += indent + `  Duration (avg): ${data.metrics.http_req_duration?.values.avg?.toFixed(2) || 'N/A'}ms\n`;
  summary += indent + `  Duration (p95): ${data.metrics.http_req_duration?.values['p(95)']?.toFixed(2) || 'N/A'}ms\n`;
  summary += indent + `  Duration (max): ${data.metrics.http_req_duration?.values.max?.toFixed(2) || 'N/A'}ms\n\n`;
  
  // Custom metrics
  if (data.metrics.errors) {
    summary += indent + `Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n`;
  }
  if (data.metrics.quotes_response_time) {
    summary += indent + `Quotes Response Time (avg): ${data.metrics.quotes_response_time.values.avg?.toFixed(2) || 'N/A'}ms\n`;
  }
  
  summary += indent + '\n===========================================\n';
  
  return summary;
}
