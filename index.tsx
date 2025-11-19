
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LocalizationProvider } from './context/LocalizationContext';

// Polyfill for HTML5 Drag and Drop on mobile devices
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behaviour";

// Initialize the polyfill
polyfill({
    // use this to make the drag image behave more like a native drag
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
    // helps with preventing scrolling while dragging
    holdToDrag: 200 
});

// Workaround for iOS/Android to prevent scrolling while dragging if needed
// Using 'touch-none' CSS class on elements is preferred, but this handles edge cases
window.addEventListener( 'touchmove', function() {}, { passive: false });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LocalizationProvider>
      <App />
    </LocalizationProvider>
  </React.StrictMode>
);