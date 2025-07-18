import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the DataContext to prevent API calls during testing
jest.mock('./contexts/DataContext', () => ({
  DataProvider: ({ children }) => children,
  useData: () => ({
    getRecentProjects: () => [],
    clients: [],
    loading: { clients: false, projects: false, blogs: false, featuredProjects: false },
    fetchClients: jest.fn(),
    featuredProjects: [],
    fetchFeaturedProjects: jest.fn(),
    fetchProjects: jest.fn(),
    data: { projects: [], blogs: [], clients: [], featuredProjects: [] },
    error: {}
  })
}));

// Mock API service to prevent actual HTTP calls
jest.mock('./services/api', () => ({
  getProjects: jest.fn(() => Promise.resolve({ data: [] })),
  getBlogs: jest.fn(() => Promise.resolve({ data: [] })),
  getClients: jest.fn(() => Promise.resolve({ data: [] })),
  getFeaturedProjects: jest.fn(() => Promise.resolve({ data: [] }))
}));

// Mock window.scrollTo for testing environment
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

test('renders app without crashing', () => {
  const { container } = render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Test that the app renders without crashing
  expect(container).toBeInTheDocument();
});
