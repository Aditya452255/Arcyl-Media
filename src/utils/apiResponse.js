import { requestContext } from "./context";

export class ApiResponse {
  /**
   * Helper to retrieve request metadata from the active context
   */
  static getMeta() {
    const store = requestContext.getStore();
    return {
      requestId: store?.requestId || null,
      timestamp: new Date().toISOString(),
    };
  }

  static success(message, data = null, statusCode = 200) {
    return Response.json(
      {
        success: true,
        message,
        data,
        error: null,
        meta: this.getMeta(),
      },
      { status: statusCode }
    );
  }

  static error(message, errorCode = "INTERNAL_ERROR", details = null, statusCode = 500) {
    return Response.json(
      {
        success: false,
        message,
        data: null,
        error: {
          code: errorCode,
          details,
        },
        meta: this.getMeta(),
      },
      { status: statusCode }
    );
  }
}
