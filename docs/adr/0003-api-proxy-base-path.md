# 0003 — API Proxy Uses /api Base Path

## Status
Accepted

## Context
The web app uses React Router with client-side routes like `/trips/:id/itinerary`.
When the dev server proxied `/trips` directly to the API, browser refreshes
on SPA routes could be intercepted by the proxy and return API 404s.

## Decision
Proxy API calls under a dedicated `/api` base path. The web client defaults to
`/api` for all API requests, and Vite proxies `/api` to the API server while
rewriting the prefix.

## Consequences
- SPA refreshes remain on the intended route.
- All API requests are namespaced under `/api`.
