import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import store from './store';
import UserTypeSelector from './components/UserTypeSelector';
import ProviderDashboard from './components/ProviderDashboard';
import ClientInterface from './components/ClientInterface';
import './styles/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const AppContent = () => {
  const { isProvider, currentUser } = useSelector(state => state.call);
  const [userTypeSelected, setUserTypeSelected] = useState(false);

  const handleUserTypeSelected = (isProviderType) => {
    setUserTypeSelected(true);
  };

  return (
    <div className="App">
      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="row align-items-center">
            <div className="col">
              <h1>
                <i className="fas fa-heartbeat me-3"></i>
                Agora Med Care
              </h1>
              <p className="subtitle mb-0">
                Secure Medical Consultations Platform
              </p>
            </div>
            {currentUser && (
              <div className="col-auto">
                <div className="user-info text-end">
                  <div className="user-name">{currentUser.name}</div>
                  <small className="user-role text-white-50">
                    {currentUser.role === 'provider' ? 'Healthcare Provider' : 'Patient'}
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {!userTypeSelected ? (
          <UserTypeSelector onUserTypeSelected={handleUserTypeSelected} />
        ) : isProvider ? (
          <ProviderDashboard />
        ) : (
          <ClientInterface />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-light py-4 mt-5">
        <div className="container text-center">
          <div className="row">
            <div className="col-md-4">
              <h6 className="text-primary">Security</h6>
              <p className="small text-muted">
                <i className="fas fa-lock me-1"></i>
                End-to-end encrypted consultations
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="text-primary">Quality</h6>
              <p className="small text-muted">
                <i className="fas fa-hd-video me-1"></i>
                High-definition video and audio
              </p>
            </div>
            <div className="col-md-4">
              <h6 className="text-primary">Support</h6>
              <p className="small text-muted">
                <i className="fas fa-headset me-1"></i>
                24/7 technical assistance
              </p>
            </div>
          </div>
          <hr />
          <p className="text-muted small mb-0">
            © 2024 Agora Med Care. HIPAA compliant medical consultation platform.
          </p>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;