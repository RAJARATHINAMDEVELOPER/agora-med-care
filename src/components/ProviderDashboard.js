import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setCallActive, 
  setCallId, 
  setInvitationEmail,
  resetCall,
  setLocalTracks,
  addRemoteUser,
  removeRemoteUser,
  updateRemoteUser
} from '../store/callSlice';
import VideoCallInterface from './VideoCallInterface';
import emailService from '../services/emailService';
import agoraService from '../services/agoraService';

const ProviderDashboard = () => {
  const dispatch = useDispatch();
  const { 
    isCallActive, 
    callId, 
    currentUser, 
    participants,
    appId
  } = useSelector(state => state.call);

  const [invitationEmail, setInvitationEmailLocal] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    // Initialize Agora service
    if (appId) {
      agoraService.initializeClient(appId);
    }
  }, [appId]);

  const generateCallId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const startCall = async () => {
    try {
      setLoading(true);
      const newCallId = generateCallId();
      dispatch(setCallId(newCallId));

      // Initialize Agora and join channel
      const token = null; // In production, generate token from your server
      const uid = Math.floor(Math.random() * 1000000);
      
      const tracks = await agoraService.joinChannel(
        newCallId, 
        token, 
        uid, 
        handleUserUpdate
      );
      
      dispatch(setLocalTracks(tracks));
      dispatch(setCallActive(true));
      
      setStatusMessage('Call started successfully! Share the call ID with patients.');
      setMessageType('success');
    } catch (error) {
      console.error('Error starting call:', error);
      setStatusMessage('Failed to start call. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const endCall = async () => {
    try {
      await agoraService.leaveChannel();
      dispatch(resetCall());
      setStatusMessage('Call ended successfully.');
      setMessageType('success');
    } catch (error) {
      console.error('Error ending call:', error);
      setStatusMessage('Error ending call.');
      setMessageType('error');
    }
  };

  const sendInvitation = async () => {
    if (!invitationEmail || !appointmentTime || !callId) {
      setStatusMessage('Please fill in all required fields.');
      setMessageType('warning');
      return;
    }

    try {
      setLoading(true);
      const result = await emailService.sendInvitation(
        invitationEmail,
        currentUser.name,
        appointmentTime,
        callId
      );
      
      setStatusMessage(`Invitation sent successfully to ${invitationEmail}`);
      setMessageType('success');
      setInvitationEmailLocal('');
    } catch (error) {
      console.error('Error sending invitation:', error);
      setStatusMessage('Failed to send invitation. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
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

  const copyCallId = () => {
    navigator.clipboard.writeText(callId);
    setStatusMessage('Call ID copied to clipboard!');
    setMessageType('success');
  };

  const shareInvitationLink = () => {
    const link = emailService.generateInvitationLink(callId);
    navigator.clipboard.writeText(link);
    setStatusMessage('Invitation link copied to clipboard!');
    setMessageType('success');
  };

  return (
    <div className="container">
      <div className="provider-dashboard fade-in">
        <div className="dashboard-header">
          <div>
            <h2 className="dashboard-title">
              <i className="fas fa-stethoscope me-2"></i>
              Provider Dashboard
            </h2>
            <p className="text-muted">Manage your medical consultations</p>
          </div>
          
          <div className="call-controls">
            {!isCallActive ? (
              <button 
                className="btn-success"
                onClick={startCall}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Starting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-video me-2"></i>
                    Start Call
                  </>
                )}
              </button>
            ) : (
              <button 
                className="btn btn-danger"
                onClick={endCall}
              >
                <i className="fas fa-phone-slash me-2"></i>
                End Call
              </button>
            )}
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

        {callId && (
          <div className="call-info bg-light p-3 rounded mb-4">
            <h4><i className="fas fa-id-card me-2"></i>Call Information</h4>
            <div className="row">
              <div className="col-md-6">
                <p><strong>Call ID:</strong> 
                  <code className="ms-2">{callId}</code>
                  <button 
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={copyCallId}
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </p>
              </div>
              <div className="col-md-6">
                <p><strong>Status:</strong> 
                  <span className={`ms-2 badge ${isCallActive ? 'bg-success' : 'bg-secondary'}`}>
                    {isCallActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
            <button 
              className="btn btn-outline-info btn-sm"
              onClick={shareInvitationLink}
            >
              <i className="fas fa-share me-1"></i>
              Copy Invitation Link
            </button>
          </div>
        )}

        {/* Invitation Form */}
        <div className="invitation-form">
          <h3><i className="fas fa-envelope me-2"></i>Send Patient Invitation</h3>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Patient Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="patient@example.com"
                  value={invitationEmail}
                  onChange={(e) => setInvitationEmailLocal(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Appointment Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button 
            className="btn-primary"
            onClick={sendInvitation}
            disabled={loading || !callId}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin me-2"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Send Invitation
              </>
            )}
          </button>
        </div>

        {/* Participants List */}
        {participants.length > 0 && (
          <div className="participants-list mt-4">
            <h4><i className="fas fa-users me-2"></i>Connected Participants ({participants.length})</h4>
            <div className="list-group">
              {participants.map((participant, index) => (
                <div key={participant.id || index} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <i className="fas fa-user me-2"></i>
                    Patient {index + 1}
                  </div>
                  <span className="badge bg-success">Connected</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video Call Interface */}
        {isCallActive && (
          <VideoCallInterface />
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;