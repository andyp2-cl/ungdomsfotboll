
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Render the app without any authentication barriers
createRoot(document.getElementById("root")!).render(<App />);
