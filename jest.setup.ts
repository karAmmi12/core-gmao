import '@testing-library/jest-dom';

// Mock uuid module
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));
