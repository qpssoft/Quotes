# Load Testing with k6

This directory contains k6 load test scripts for the Quotes Backend API.

## Prerequisites

1. Install k6:
   ```bash
   # Windows (using winget)
   winget install k6 --source winget
   
   # macOS (using Homebrew)
   brew install k6
   
   # Linux
   sudo gpg -k
   sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. Ensure the backend is running:
   ```bash
   # From quotes-backend directory
   .\start-backend.ps1
   ```

## Test Scripts

### 1. Baseline Test (`baseline-test.js`)

**Purpose**: Establish baseline performance metrics with minimal load (10 concurrent users).

**What it tests**:
- Health check endpoint
- Public quote endpoints (GET /api/quotes)
- Query filtering (category, language, author)
- Individual quote retrieval (GET /api/quotes/{id})

**Run**:
```bash
k6 run baseline-test.js
```

**Expected Results**:
- P95 response time: < 500ms
- Error rate: < 1%
- All checks passing

### 2. Load Test (`load-test.js`)

**Purpose**: Test system under heavy load with 1000 concurrent users.

**What it tests**:
- Public read operations (80% of traffic)
  - Health checks
  - Quote listings with various filters
  - Individual quote retrieval
- Authenticated operations (20% of traffic)
  - User authentication
  - User profile access
  - User quote submissions

**Load Profile**:
- Ramp up: 0 → 100 → 500 → 1000 users (5 minutes)
- Sustained load: 1000 users (5 minutes)
- Ramp down: 1000 → 500 → 100 → 0 (4 minutes)
- Total duration: ~14 minutes

**Run**:
```bash
k6 run load-test.js
```

**Expected Results**:
- P95 response time: < 500ms
- Error rate: < 1%
- Request failure rate: < 1%
- Throughput: > 100 requests/second
- Zero errors at peak load

### 3. Custom Base URL

To test against a different environment:

```bash
k6 run -e BASE_URL=https://your-api.azurewebsites.net load-test.js
```

## Performance Targets (T182)

Based on task requirements:

| Metric | Target | Rationale |
|--------|--------|-----------|
| Concurrent Users | 1000 | Simulate realistic peak load |
| P95 Response Time | < 500ms | 95% of requests complete quickly |
| Error Rate | 0% | Zero errors under load |
| Throughput | > 100 req/s | Adequate request handling capacity |

## Interpreting Results

### Good Performance
```
✅ http_req_duration..............: avg=180ms  min=50ms  med=150ms  max=450ms  p(95)=380ms
✅ http_req_failed................: 0.00%
✅ http_reqs......................: 125.5/s
✅ errors.........................: 0.00%
```

### Poor Performance
```
❌ http_req_duration..............: avg=850ms  min=100ms  med=700ms  max=2500ms  p(95)=1800ms
❌ http_req_failed................: 3.45%
❌ errors.........................: 2.89%
```

### Common Issues

**High response times (> 500ms)**:
- Check database query performance
- Review caching effectiveness (5-minute TTL)
- Check for N+1 query problems
- Verify connection pooling is configured

**High error rates**:
- Check Application Insights for exceptions
- Review rate limiting configuration
- Verify authentication token handling
- Check for resource exhaustion

**Request failures**:
- Network connectivity issues
- Backend not running or crashed
- Port conflicts (7071)
- Rate limiting too aggressive

## Optimizations Implemented (T181)

The following optimizations should help achieve performance targets:

1. **Caching** (5-minute TTL)
   - QuotesFunction caches GET requests
   - Reduces database load by 80%+

2. **Rate Limiting**
   - Admin: 1000 req/min
   - Authenticated: 500 req/min
   - Anonymous: 100 req/min
   - Prevents API abuse without blocking legitimate traffic

3. **Application Insights**
   - Performance monitoring
   - Exception tracking
   - Custom metrics for operations

## Next Steps After T182

If load tests pass:
- ✅ Mark T182 complete
- Move to T183: Security scanning
- Consider T189: Cost verification

If load tests fail:
- Analyze Application Insights metrics
- Identify bottlenecks (database, serialization, auth)
- Implement additional optimizations
- Re-run tests to verify improvements

## Additional Resources

- [k6 Documentation](https://k6.io/docs/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/api-load-testing/)
- [k6 Metrics Reference](https://k6.io/docs/using-k6/metrics/)
