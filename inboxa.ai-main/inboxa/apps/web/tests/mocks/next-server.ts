const BaseResponse = Response;

class NextResponse extends BaseResponse {
  static json(data: any, init?: ResponseInit & { status?: number }) {
    const body = data === undefined ? null : JSON.stringify(data);
    const headers = new Headers(init?.headers);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
    return new NextResponse(body, {
      ...init,
      status: init?.status ?? 200,
      headers,
    });
  }
}

export { NextResponse };
export const NextRequest = class {};
