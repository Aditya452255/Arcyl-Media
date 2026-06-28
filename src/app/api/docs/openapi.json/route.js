import openapiSchema from "../../../../utils/openapi.json";

/**
 * GET /api/docs/openapi.json
 * Returns OpenAPI specification payload in JSON format.
 */
export async function GET() {
  return Response.json(openapiSchema);
}
