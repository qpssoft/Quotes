// K6 Full Load Test
// Purpose: Test system under heavy load with 1000 concurrent users
// Target: 95% of requests < 500ms, zero errors

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Custom metrics
const errorRate = new Rate('errors');
const quotesResponseTime = new Trend('quotes_response_time');
const authResponseTime = new Trend('auth_response_time');
const crudResponseTime = new Trend('crud_response_time');
const requestsPerSecond = new Counter('requests_per_second');

// Test configuration - Full load (1000 concurrent users)
export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 500 },   // Ramp up to 500 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users for 5 minutes
    { duration: '2m', target: 500 },   // Ramp down to 500
    { duration: '1m', target: 100 },   // Ramp down to 100
    { duration: '1m', target: 0 },     // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],     // 95% of requests under 500ms
    'http_req_duration{type:public}': ['p(95)<300'], // Public endpoints faster
    'http_req_duration{type:auth}': ['p(95)<800'],   // Auth can be slightly slower
    errors: ['rate<0.01'],                // Error rate under 1%
    http_req_failed: ['rate<0.01'],       // Request failure rate under 1%
    http_reqs: ['rate>100'],              // At least 100 req/s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:7071';
const TEST_EMAIL = `loadtest-${Date.now()}@example.com`;
const TEST_PASSWORD = 'LoadTest123!';

// Test data
let authToken = null;
let testQuoteId = null;
let existingQuotes = [];

export function setup() {
  console.log('Setting up test data...');
  
  // Get existing quotes for read operations
  const quotesRes = http.get(`${BASE_URL}/api/quotes`);
  if (quotesRes.status === 200) {
    existingQuotes = quotesRes.json();
    console.log(`Loaded ${existingQuotes.length} existing quotes`);
  }
  
  return { existingQuotes };
}

export default function (data) {
  requestsPerSecond.add(1);
  
  // 80% of users perform read-only operations (public endpoints)
  if (Math.random() < 0.8) {
    group('Public Read Operations', function () {
      publicReadOperations(data);
    });
  } else {
    // 20% of users perform authenticated operations
    group('Authenticated Operations', function () {
      authenticatedOperations(data);
    });
  }
  
  // Think time - simulate real user behavior
  sleep(randomIntBetween(1, 3));
}

function publicReadOperations(data) {
  // Health check (occasional)
  if (Math.random() < 0.1) {
    const healthRes = http.get(`${BASE_URL}/api/health`, {
      tags: { type: 'public', endpoint: 'health' },
    });
    check(healthRes, { 'health check OK': (r) => r.status === 200 });
    errorRate.add(healthRes.status !== 200);
  }
  
  // Get all quotes
  const start = Date.now();
  const quotesRes = http.get(`${BASE_URL}/api/quotes`, {
    tags: { type: 'public', endpoint: 'quotes' },
  });
  quotesResponseTime.add(Date.now() - start);
  
  check(quotesRes, {
    'get all quotes OK': (r) => r.status === 200,
    'quotes response < 500ms': (r) => r.timings.duration < 500,
  });
  errorRate.add(quotesRes.status !== 200);
  
  sleep(0.5);
  
  // Get quotes with filters (category, language, author)
  const filters = [
    '?category=wisdom',
    '?category=love',
    '?language=vi',
    '?language=en',
    '?author=Confucius',
  ];
  const randomFilter = filters[randomIntBetween(0, filters.length - 1)];
  
  const filteredRes = http.get(`${BASE_URL}/api/quotes${randomFilter}`, {
    tags: { type: 'public', endpoint: 'quotes-filtered' },
  });
  check(filteredRes, { 'filtered quotes OK': (r) => r.status === 200 });
  errorRate.add(filteredRes.status !== 200);
  
  sleep(0.5);
  
  // Get quote by ID (if quotes exist)
  if (data.existingQuotes && data.existingQuotes.length > 0) {
    const randomQuote = data.existingQuotes[randomIntBetween(0, data.existingQuotes.length - 1)];
    const quoteByIdRes = http.get(`${BASE_URL}/api/quotes/${randomQuote.Id}`, {
      tags: { type: 'public', endpoint: 'quote-by-id' },
    });
    check(quoteByIdRes, {
      'get quote by ID OK': (r) => r.status === 200,
      'quote by ID < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(quoteByIdRes.status !== 200);
  }
}

function authenticatedOperations(data) {
  // Login (or use cached token)
  if (!authToken) {
    const loginStart = Date.now();
    const loginRes = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({
        Email: 'admin@quotes.local',
        Password: 'Admin123!',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { type: 'auth', endpoint: 'login' },
      }
    );
    authResponseTime.add(Date.now() - loginStart);
    
    const loginSuccess = check(loginRes, {
      'login successful': (r) => r.status === 200,
      'login response has token': (r) => {
        try {
          const body = r.json();
          return body && body.AccessToken;
        } catch {
          return false;
        }
      },
    });
    
    if (loginSuccess && loginRes.status === 200) {
      try {
        const loginData = loginRes.json();
        authToken = loginData.AccessToken;
      } catch (e) {
        console.error('Failed to parse login response:', e);
      }
    }
    
    errorRate.add(!loginSuccess);
  }
  
  // If we have a token, perform authenticated operations
  if (authToken) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    };
    
    // Get current user profile
    const userRes = http.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { type: 'auth', endpoint: 'me' },
    });
    check(userRes, { 'get user profile OK': (r) => r.status === 200 });
    errorRate.add(userRes.status !== 200);
    
    sleep(0.5);
    
    // Get my quotes (contributor operation)
    const myQuotesRes = http.get(`${BASE_URL}/api/quotes/my-quotes`, {
      headers: { Authorization: `Bearer ${authToken}` },
      tags: { type: 'auth', endpoint: 'my-quotes' },
    });
    check(myQuotesRes, { 'get my quotes OK': (r) => r.status === 200 });
    errorRate.add(myQuotesRes.status !== 200);
  }
  
  sleep(1);
}

export function teardown(data) {
  console.log('Test completed - cleaning up...');
}

export function handleSummary(data) {
  const passed = 
    data.metrics.http_req_duration?.values['p(95)'] < 500 &&
    data.metrics.errors?.values.rate < 0.01 &&
    data.metrics.http_req_failed?.values.rate < 0.01;
  
  console.log('\n========================================');
  console.log('LOAD TEST RESULTS');
  console.log('========================================');
  console.log(`Target: 1000 concurrent users`);
  console.log(`Duration: ${(data.state.testRunDurationMs / 1000).toFixed(0)}s`);
  console.log(`Total Requests: ${data.metrics.http_reqs?.values.count || 0}`);
  console.log(`Failed Requests: ${((data.metrics.http_req_failed?.values.rate || 0) * 100).toFixed(2)}%`);
  console.log(`Error Rate: ${((data.metrics.errors?.values.rate || 0) * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${(data.metrics.http_req_duration?.values.avg || 0).toFixed(2)}ms`);
  console.log(`P95 Response Time: ${(data.metrics.http_req_duration?.values['p(95)'] || 0).toFixed(2)}ms`);
  console.log(`Max Response Time: ${(data.metrics.http_req_duration?.values.max || 0).toFixed(2)}ms`);
  console.log(`Requests/sec: ${(data.metrics.http_reqs?.values.rate || 0).toFixed(2)}`);
  console.log('\nTest Status: ' + (passed ? '✅ PASSED' : '❌ FAILED'));
  console.log('========================================\n');
  
  return {
    'load-test-results.json': JSON.stringify(data, null, 2),
    'load-test-summary.txt': generateTextSummary(data),
    stdout: generateConsoleSummary(data),
  };
}

function generateTextSummary(data) {
  let summary = '========================================\n';
  summary += 'K6 LOAD TEST RESULTS\n';
  summary += '========================================\n\n';
  
  summary += 'Test Configuration:\n';
  summary += '  Target: 1000 concurrent users\n';
  summary += `  Duration: ${(data.state.testRunDurationMs / 1000).toFixed(0)}s\n`;
  summary += `  Base URL: ${BASE_URL}\n\n`;
  
  summary += 'Performance Metrics:\n';
  summary += `  Total Requests: ${data.metrics.http_reqs?.values.count || 0}\n`;
  summary += `  Requests/sec: ${(data.metrics.http_reqs?.values.rate || 0).toFixed(2)}\n`;
  summary += `  Failed Requests: ${((data.metrics.http_req_failed?.values.rate || 0) * 100).toFixed(2)}%\n`;
  summary += `  Error Rate: ${((data.metrics.errors?.values.rate || 0) * 100).toFixed(2)}%\n\n`;
  
  summary += 'Response Times:\n';
  summary += `  Average: ${(data.metrics.http_req_duration?.values.avg || 0).toFixed(2)}ms\n`;
  summary += `  Median (p50): ${(data.metrics.http_req_duration?.values.med || 0).toFixed(2)}ms\n`;
  summary += `  P90: ${(data.metrics.http_req_duration?.values['p(90)'] || 0).toFixed(2)}ms\n`;
  summary += `  P95: ${(data.metrics.http_req_duration?.values['p(95)'] || 0).toFixed(2)}ms\n`;
  summary += `  P99: ${(data.metrics.http_req_duration?.values['p(99)'] || 0).toFixed(2)}ms\n`;
  summary += `  Max: ${(data.metrics.http_req_duration?.values.max || 0).toFixed(2)}ms\n\n`;
  
  summary += 'Thresholds:\n';
  const p95 = data.metrics.http_req_duration?.values['p(95)'] || 0;
  const errorRate = data.metrics.errors?.values.rate || 0;
  const failRate = data.metrics.http_req_failed?.values.rate || 0;
  
  summary += `  P95 < 500ms: ${p95 < 500 ? '✅ PASS' : '❌ FAIL'} (${p95.toFixed(2)}ms)\n`;
  summary += `  Error rate < 1%: ${errorRate < 0.01 ? '✅ PASS' : '❌ FAIL'} (${(errorRate * 100).toFixed(2)}%)\n`;
  summary += `  Fail rate < 1%: ${failRate < 0.01 ? '✅ PASS' : '❌ FAIL'} (${(failRate * 100).toFixed(2)}%)\n\n`;
  
  const allPassed = p95 < 500 && errorRate < 0.01 && failRate < 0.01;
  summary += `Overall Result: ${allPassed ? '✅ PASSED' : '❌ FAILED'}\n`;
  summary += '========================================\n';
  
  return summary;
}

function generateConsoleSummary(data) {
  return generateTextSummary(data);
}
