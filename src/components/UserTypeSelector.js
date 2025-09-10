import React from 'react';
import { useDispatch } from 'react-redux';
import { setUserType, setCurrentUser } from '../store/callSlice';

const UserTypeSelector = ({ onUserTypeSelected }) => {
  const dispatch = useDispatch();

  const selectUserType = (isProvider) => {
    dispatch(setUserType(isProvider));
    dispatch(setCurrentUser({
      id: Math.random().toString(36).substr(2, 9),
      name: isProvider ? 'Healthcare Provider' : 'Patient',
      role: isProvider ? 'provider' : 'client'
    }));
    onUserTypeSelected(isProvider);
  };

  return (
    <div className="container">
      <div className="user-type-selector fade-in">
        <h2>Welcome to Agora Med Care</h2>
        <p className="lead text-muted mb-4">
          Secure, professional medical consultations powered by advanced video technology
        </p>
        
        <div className="user-type-buttons">
          <button 
            className="user-type-btn"
            onClick={() => selectUserType(true)}
          >
            <i className="fas fa-user-md"></i>
            <span>Healthcare Provider</span>
            <small className="text-muted">Start and manage consultations</small>
          </button>
          
          <button 
            className="user-type-btn"
            onClick={() => selectUserType(false)}
          >
            <i className="fas fa-user"></i>
            <span>Patient</span>
            <small className="text-muted">Join consultation calls</small>
          </button>
        </div>
        
        <div className="mt-4 text-center">
          <small className="text-muted">
            <i className="fas fa-lock me-1"></i>
            Your privacy and security are our top priorities
          </small>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelector;