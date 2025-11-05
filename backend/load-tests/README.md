K6 load tests

Requirements
- Install k6 (https://k6.io/docs/getting-started/installation/) or run via Docker.

Run locally (assumes backend running on localhost:3000):

```powershell
# run the backend (in another terminal)
npm run start

# run the load test (install k6 locally)
k6 run load-tests/get-root-k6.js
```

Run via Docker:

```powershell
docker run --rm -i loadimpact/k6 run - < load-tests/get-root-k6.js
```

Notes
- This is a minimal example that hits GET /; adapt the script to target endpoints of interest (e.g. chat endpoints or API routes). Do not run load tests against production.
