class HttpClient {
  private baseURL: string;

  private headers: any;

  constructor(options: any) {
    this.baseURL = options.baseURL || '';
    this.headers = options.headers || {};
  }

  private async fetchResponse(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(this.baseURL + endpoint, {
      ...options,
      headers: this.headers,
    }).catch((_err) => {
      return new Response(
        new Blob([JSON.stringify({ responseMessage: 'Network failure' })]),
        { status: 503 }
      );
    });
    return res;
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value;
    return this;
  }

  getHeader(key: string) {
    return this.headers[key];
  }

  setBearerAuth(token: string) {
    this.headers.Authorization = `Bearer ${token}`;
    return this;
  }

  get(endpoint: string, options = {}) {
    return this.fetchResponse(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  post(endpoint: string, body: any, options = {}) {
    return this.fetchResponse(endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      method: 'POST',
    });
  }

  put(endpoint: string, body: any, options = {}) {
    return this.fetchResponse(endpoint, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
      method: 'PUT',
    });
  }

  delete(endpoint: string, options = {}) {
    return this.fetchResponse(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  jsonBody() {
    return this.setHeader('content-type', 'application/json');
  }
}

export default HttpClient;
