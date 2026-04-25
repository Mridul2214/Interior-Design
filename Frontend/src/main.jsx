import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('Main.jsx entry point');
// alert('If you see this, JavaScript is running');

createRoot(document.getElementById('root')).render(
    <App />
)
