// Mock for database operations
const mockApps = [
  {
    id: 1,
    name: "Test App 1",
    description: "Test Description 1",
    type: "web",
    platform: "web",
    tag: "test",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    name: "Test App 2",
    description: "Test Description 2",
    type: "miniprogram",
    platform: "wechat",
    tag: "test",
    created_at: "2024-01-02T00:00:00.000Z",
    updated_at: "2024-01-02T00:00:00.000Z",
  },
];

const mockDatabase = {
  getApps: jest.fn((params) => {
    return Promise.resolve({
      apps: mockApps,
      total: mockApps.length,
      page: params.page || 1,
      limit: params.limit || 10,
    });
  }),

  createApp: jest.fn((appData) => {
    const newApp = {
      id: Date.now(),
      ...appData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return Promise.resolve(newApp);
  }),

  getAppById: jest.fn((id) => {
    const app = mockApps.find((a) => a.id === parseInt(id));
    return Promise.resolve(app || null);
  }),

  updateApp: jest.fn((id, data) => {
    const app = mockApps.find((a) => a.id === parseInt(id));
    if (app) {
      Object.assign(app, data, { updated_at: new Date().toISOString() });
      return Promise.resolve(app);
    }
    return Promise.resolve(null);
  }),

  deleteApp: jest.fn((id) => {
    const index = mockApps.findIndex((a) => a.id === parseInt(id));
    if (index !== -1) {
      mockApps.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }),
};

module.exports = mockDatabase;
