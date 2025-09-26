// Mock for lib/models/app
const mockDatabase = require('./database')

module.exports = {
  getApps: mockDatabase.getApps,
  createApp: mockDatabase.createApp,
  getAppById: mockDatabase.getAppById,
  updateApp: mockDatabase.updateApp,
  deleteApp: mockDatabase.deleteApp,
}
