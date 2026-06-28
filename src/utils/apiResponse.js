export class ApiResponse {
  static success(message, data = null, statusCode = 200) {
    return Response.json(
      {
        success: true,
        message,
        data,
        error: null,
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
      },
      { status: statusCode }
    );
  }
}
