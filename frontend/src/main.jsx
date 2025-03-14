import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'sonner'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { persistStore } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import ErrorBoundary from '/utils/ErrorBoundary.jsx'

const persistor = persistStore(store);

const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-pulse text-xl">Loading application...</div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate
          loading={<Loading />}
          persistor={persistor}
          onBeforeLift={() => {
            // Initialize analytics or other services here
          }}
        >
          <App />
          <Toaster
            position="top-right"
            duration={4000}
            visibleToasts={3}
            richColors
            closeButton
            toastOptions={{
              style: { fontFamily: 'inherit' }
            }}
          />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)