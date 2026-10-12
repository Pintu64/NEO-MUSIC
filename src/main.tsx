try {
  let curr: unknown = window;
  let activeFetch = window.fetch;
  while (curr && curr !== Object.prototype) {
    try {
      const desc = Object.getOwnPropertyDescriptor(curr, 'fetch');
      if (desc && desc.get && !desc.set) {
        Object.defineProperty(curr, 'fetch', {
          get() {
            return activeFetch;
          },
          set(fn: typeof window.fetch) {
            activeFetch = fn;
          },
          configurable: true,
          enumerable: desc.enumerable !== false,
        });
      }
    } catch (_) {}
    curr = Object.getPrototypeOf(curr);
  }
} catch (_) {}

import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
