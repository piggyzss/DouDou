// Mock for next/server
const mockResponse = {
  json: jest.fn(() => Promise.resolve({})),
  status: 200,
  headers: new Headers(),
};

const NextResponse = {
  json: jest.fn((data, init) => {
    const response = {
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Headers(init?.headers || {}),
    };
    return response;
  }),
};

module.exports = {
  NextResponse,
};
