# AI Appointment Function Schema

Use this schema with OpenAI function-calling to ensure the model returns a strict JSON payload for appointment creation.

Function name: create_appointment

JSON schema (for the `parameters` field):

{
  "type": "object",
  "properties": {
    "customerId": { "type": "integer" },
    "serviceId": { "type": ["integer", "null"] },
    "serviceName": { "type": ["string", "null"] },
    "startAt": { "type": "string", "format": "date-time" },
    "durationMinutes": { "type": "integer" },
    "timezone": { "type": "string" },
    "notes": { "type": "string" },
    "requestId": { "type": "string" }
  },
  "required": ["customerId", "startAt"]
}

Example function call response (model output):

{
  "name": "create_appointment",
  "arguments": "{\"customerId\": 123, \"serviceId\": 5, \"startAt\": \"2025-10-21T15:00:00Z\", \"durationMinutes\": 30, \"notes\": \"Discuss onboarding\", \"requestId\": \"req-abc-123\"}"
}

Server-side handling notes:
- Parse `arguments` as JSON and validate against the DTO.
- Use `requestId` for idempotency.
- Create a draft appointment and emit a socket event with the draft and a confirmation action.
