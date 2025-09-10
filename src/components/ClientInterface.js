import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setCallActive, 
  setCallId, 
  resetCall,
  setLocalTracks,
  addRemoteUser,
  removeRemoteUser,
  updateRemoteUser
} from '../store/callSlice';
import VideoCallInterface from './VideoCallInterface';
import agoraService from '../services/agoraService';
import emailService from '../services/emailService';

const ClientInterface = () => {
  const dispatch = useDispatch();
  const { 
    isCallActive, 
    callId, 
    currentUser, 
    appId
  } = useSelector(state => state.call);

  const [manualCallId, setManualCallId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [invitationData, setInvitationData] = useState(null);

  useEffect(() => {
    // Check if user came from email invitation
    const invitation = emailService.parseInvitationFromUrl();
    if (invitation) {
      setInvitationData(invitation);
      dispatch(setCallId(invitation.callId));
      setManualCallId(invitation.callId);
      setStatusMessage('Welcome! You were invited to join this consultation.');
      setMessageType('success');
    }

    // Initialize Agora service
    if (appId) {
      agoraService.initializeClient(appId);
    }
  }, [dispatch, appId]);

  const joinCall = async () => {
    if (!manualCallId.trim()) {
      setStatusMessage('Please enter a valid Call ID.');
      setMessageType('warning');
      return;
    }

    if (!patientName.trim()) {
      setStatusMessage('Please enter your name.');
      setMessageType('warning');
      return;
    }

    try {
      setLoading(true);
      dispatch(setCallId(manualCallId));

      // Initialize Agora and join channel
      const token = null; // In production, generate token from your server
      const uid = Math.floor(Math.random() * 1000000);
      
      const tracks = await agoraService.joinChannel(
        manualCallId, 
        token, 
        uid, 
        handleUserUpdate
      );
      
      dispatch(setLocalTracks(tracks));
      dispatch(setCallActive(true));
      
      setStatusMessage(`Successfully joined the consultation. Welcome, ${patientName}!`);
      setMessageType('success');
    } catch (error) {
      console.error('Error joining call:', error);
      setStatusMessage('Failed to join call. Please check the Call ID and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const leaveCall = async () => {
    try {
      await agoraService.leaveChannel();
      dispatch(resetCall());
      setStatusMessage('You have left the consultation.');
      setMessageType('success');
    } catch (error) {
      console.error('Error leaving call:', error);
      setStatusMessage('Error leaving call.');
      setMessageType('error');
    }
  };

  const handleUserUpdate = (event, data) => {
    switch (event) {
      case 'user-joined':
        dispatch(addRemoteUser({ uid: data.uid, hasVideo: false, hasAudio: false }));
        break;
      case 'user-left':
        dispatch(removeRemoteUser(data.uid));
        break;
      case 'user-published':
        dispatch(updateRemoteUser({ 
          uid: data.uid, 
          updates: data.mediaType === 'video' ? { hasVideo: true } : { hasAudio: true }
        }));
        break;
      case 'user-unpublished':
        dispatch(updateRemoteUser({ 
          uid: data.uid, 
          updates: data.mediaType === 'video' ? { hasVideo: false } : { hasAudio: false }
        }));
        break;
    }
  };

  if (isCallActive) {
    return (
      <div className="container">
        <div className="client-interface fade-in">
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title">
                <i className="fas fa-video me-2"></i>
                Medical Consultation
              </h2>
              <p className="text-muted">Connected as: {patientName || 'Patient'}</p>
            </div>
            
            <div className="call-controls">
              <button 
                className="btn btn-danger"
                onClick={leaveCall}
              >
                <i className="fas fa-phone-slash me-2"></i>
                Leave Call
              </button>
            </div>
          </div>

          {statusMessage && (
            <div className={`status-message ${messageType}`}>
              <i className={`fas ${
                messageType === 'success' ? 'fa-check-circle' : 
                messageType === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
              } me-2`}></i>
              {statusMessage}
            </div>
          )}

          <VideoCallInterface />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="client-interface fade-in">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-gradient text-white text-center py-4" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                <h3 className="mb-0">
                  <i className="fas fa-user-injured me-2"></i>
                  Join Medical Consultation
                </h3>
                <p className="mb-0 mt-2 opacity-75">Enter your details to connect with your healthcare provider</p>
              </div>
              
              <div className="card-body p-4">
                {statusMessage && (
                  <div className={`status-message ${messageType}`}>
                    <i className={`fas ${
                      messageType === 'success' ? 'fa-check-circle' : 
                      messageType === 'error' ? 'fa-exclamation-circle' : 
                      'fa-info-circle'
                    } me-2`}></i>
                    {statusMessage}
                  </div>
                )}

                {invitationData && (
                  <div className="alert alert-info" role="alert">
                    <i className="fas fa-envelope me-2"></i>
                    <strong>Invitation Details:</strong>
                    <br />
                    You were invited to join Call ID: <code>{invitationData.callId}</code>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); joinCall(); }}>
                  <div className="form-group mb-3">
                    <label className="form-label">
                      <i className="fas fa-user me-2"></i>
                      Your Name
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter your full name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                    />
                    <small className="form-text text-muted">
                      This name will be visible to your healthcare provider
                    </small>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label">
                      <i className="fas fa-key me-2"></i>
                      Call ID
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter the Call ID provided by your doctor"
                      value={manualCallId}
                      onChange={(e) => setManualCallId(e.target.value.toUpperCase())}
                      required
                    />
                    <small className="form-text text-muted">
                      The Call ID was provided in your appointment invitation
                    </small>
                  </div>

                  <div className="d-grid">
                    <button 
                      type="submit"
                      className="btn btn-lg"
                      style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', color: 'white'}}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          Joining Consultation...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-video me-2"></i>
                          Join Consultation
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 pt-4 border-top">
                  <h6 className="text-muted mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Before joining your consultation:
                  </h6>
                  <ul className="list-unstyled small text-muted">
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Ensure you have a stable internet connection
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Test your camera and microphone
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Find a quiet, well-lit space
                    </li>
                    <li className="mb-2">
                      <i className="fas fa-check text-success me-2"></i>
                      Have your medical history and current medications ready
                    </li>
                  </ul>
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    <i className="fas fa-shield-alt me-1"></i>
                    This is a secure, encrypted medical consultation platform
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInterface;