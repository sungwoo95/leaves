import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(<App />);
} catch (error) {
  console.error('Failed to initialize React application:', error);
}
