import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');
console.log('🔍 Buscando elemento root:', rootElement);

if (rootElement) {
  console.log('✅ Elemento root encontrado');
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('✅ App renderizada');
  } catch (err) {
    console.error('❌ Error al renderizar:', err);
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-size: 16px; white-space: pre-wrap; background: #ffe0e0;"><strong>ERROR al renderizar:</strong> ${(err as Error).message}\n\n${(err as Error).stack}</div>`;
  }
} else {
  console.error('❌ No se encontró elemento root');
  document.body.innerHTML = '<div style="color: red; font-size: 20px; padding: 20px;">ERROR: No se encontró div#root</div>';
}
