import React, { useState, useEffect, useRef } from 'react';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useSelector, useDispatch } from 'react-redux';
import AgoraRTC from 'agora-rtc-sdk-ng';

// PLACEHOLDER CREDENTIALS - Replace with your actual Agora credentials
const AGORA_APP_ID = 'YOUR_APP_ID_HERE'; // Replace with your Agora App ID
const TEMP_TOKEN = 'YOUR_TEMP_TOKEN_HERE'; // Replace with your temporary token or use token server

// Redux Toolkit Slice for Consultation State
const consultationSlice = createSlice({
  name: 'consultation',
  initialState: {
    roomId: '',
    userRole: 'provider', // 'provider' or 'client'
    isJoined: false,
    localTracks: {
      videoTrack: null,
      audioTrack: null,
      screenTrack: null
    },
    participants: [],
    isAudioMuted: false,
    isVideoMuted: false,
    isScreenSharing: false,
    isLoading: false,
    error: null,
    showInviteModal: false
  },
  reducers: {
    setRoomId: (state, action) => {
      state.roomId = action.payload;
    },
    setUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    setJoined: (state, action) => {
      state.isJoined = action.payload;
    },
    setLocalTracks: (state, action) => {
      state.localTracks = { ...state.localTracks, ...action.payload };
    },
    addParticipant: (state, action) => {
      const participant = action.payload;
      if (!state.participants.find(p => p.uid === participant.uid)) {
        state.participants.push(participant);
      }
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p.uid !== action.payload);
    },
    updateParticipant: (state, action) => {
      const { uid, updates } = action.payload;
      const participant = state.participants.find(p => p.uid === uid);
      if (participant) {
        Object.assign(participant, updates);
      }
    },
    toggleAudioMute: (state) => {
      state.isAudioMuted = !state.isAudioMuted;
    },
    toggleVideoMute: (state) => {
      state.isVideoMuted = !state.isVideoMuted;
    },
    toggleScreenShare: (state) => {
      state.isScreenSharing = !state.isScreenSharing;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    toggleInviteModal: (state) => {
      state.showInviteModal = !state.showInviteModal;
    }
  }
});

const {
  setRoomId,
  setUserRole,
  setJoined,
  setLocalTracks,
  addParticipant,
  removeParticipant,
  updateParticipant,
  toggleAudioMute,
  toggleVideoMute,
  toggleScreenShare,
  setLoading,
  setError,
  toggleInviteModal
} = consultationSlice.actions;

// Redux Store
const store = configureStore({
  reducer: {
    consultation: consultationSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['consultation/setLocalTracks'],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['payload.videoTrack', 'payload.audioTrack', 'payload.screenTrack'],
        // Ignore these paths in the state
        ignoredPaths: ['consultation.localTracks']
      }
    })
});

// Custom Hook for Agora RTC
const useAgoraRTC = () => {
  const dispatch = useDispatch();
  const { roomId, userRole, isJoined, localTracks, isAudioMuted, isVideoMuted, isScreenSharing } = useSelector(state => state.consultation);
  const clientRef = useRef(null);

  useEffect(() => {
    // Initialize Agora client
    clientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    // Set up event listeners
    clientRef.current.on('user-published', handleUserPublished);
    clientRef.current.on('user-unpublished', handleUserUnpublished);
    clientRef.current.on('user-joined', handleUserJoined);
    clientRef.current.on('user-left', handleUserLeft);

    return () => {
      leaveChannel();
    };
  }, []);

  const handleUserPublished = async (user, mediaType) => {
    console.log('User published:', user.uid, mediaType);
    await clientRef.current.subscribe(user, mediaType);
    
    dispatch(updateParticipant({
      uid: user.uid,
      updates: {
        [mediaType === 'video' ? 'videoTrack' : 'audioTrack']: user[mediaType === 'video' ? 'videoTrack' : 'audioTrack']
      }
    }));

    if (mediaType === 'video') {
      const videoElement = document.getElementById(`remote-video-${user.uid}`);
      if (videoElement) {
        user.videoTrack.play(videoElement);
      }
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    console.log('User unpublished:', user.uid, mediaType);
    dispatch(updateParticipant({
      uid: user.uid,
      updates: {
        [mediaType === 'video' ? 'videoTrack' : 'audioTrack']: null
      }
    }));
  };

  const handleUserJoined = (user) => {
    console.log('User joined:', user.uid);
    dispatch(addParticipant({
      uid: user.uid,
      videoTrack: null,
      audioTrack: null
    }));
  };

  const handleUserLeft = (user) => {
    console.log('User left:', user.uid);
    dispatch(removeParticipant(user.uid));
  };

  const joinChannel = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      if (!roomId) {
        throw new Error('Room ID is required');
      }

      console.log('Joining channel:', roomId, 'as', userRole);
      
      // Join the channel
      await clientRef.current.join(AGORA_APP_ID, roomId, TEMP_TOKEN, null);
      
      // Create and publish local tracks
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      const videoTrack = await AgoraRTC.createCameraVideoTrack();
      
      dispatch(setLocalTracks({ audioTrack, videoTrack }));
      
      // Play local video preview
      const localVideoElement = document.getElementById('local-video');
      if (localVideoElement) {
        videoTrack.play(localVideoElement);
      }
      
      // Publish tracks
      await clientRef.current.publish([audioTrack, videoTrack]);
      
      dispatch(setJoined(true));
      console.log('Successfully joined channel');
      
    } catch (error) {
      console.error('Failed to join channel:', error);
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const leaveChannel = async () => {
    try {
      dispatch(setLoading(true));
      
      // Stop and close local tracks
      if (localTracks.audioTrack) {
        localTracks.audioTrack.stop();
        localTracks.audioTrack.close();
      }
      if (localTracks.videoTrack) {
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
      }
      if (localTracks.screenTrack) {
        localTracks.screenTrack.stop();
        localTracks.screenTrack.close();
      }
      
      // Leave the channel
      await clientRef.current.leave();
      
      dispatch(setLocalTracks({ audioTrack: null, videoTrack: null, screenTrack: null }));
      dispatch(setJoined(false));
      dispatch(removeParticipant('all'));
      
      console.log('Left channel successfully');
    } catch (error) {
      console.error('Failed to leave channel:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const toggleMuteAudio = async () => {
    if (localTracks.audioTrack) {
      await localTracks.audioTrack.setEnabled(isAudioMuted);
      dispatch(toggleAudioMute());
      console.log('Audio', isAudioMuted ? 'unmuted' : 'muted');
    }
  };

  const toggleMuteVideo = async () => {
    if (localTracks.videoTrack) {
      await localTracks.videoTrack.setEnabled(isVideoMuted);
      dispatch(toggleVideoMute());
      console.log('Video', isVideoMuted ? 'unmuted' : 'muted');
    }
  };

  const toggleScreenShareFunc = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenTrack = await AgoraRTC.createScreenVideoTrack();
        dispatch(setLocalTracks({ screenTrack }));
        
        // Replace video track with screen track
        await clientRef.current.unpublish(localTracks.videoTrack);
        await clientRef.current.publish(screenTrack);
        
        // Play screen share in local video
        const localVideoElement = document.getElementById('local-video');
        if (localVideoElement) {
          screenTrack.play(localVideoElement);
        }
        
        dispatch(toggleScreenShare());
        console.log('Screen sharing started');
      } else {
        // Stop screen sharing
        if (localTracks.screenTrack) {
          await clientRef.current.unpublish(localTracks.screenTrack);
          localTracks.screenTrack.stop();
          localTracks.screenTrack.close();
        }
        
        // Publish video track again
        if (localTracks.videoTrack) {
          await clientRef.current.publish(localTracks.videoTrack);
          const localVideoElement = document.getElementById('local-video');
          if (localVideoElement) {
            localTracks.videoTrack.play(localVideoElement);
          }
        }
        
        dispatch(setLocalTracks({ screenTrack: null }));
        dispatch(toggleScreenShare());
        console.log('Screen sharing stopped');
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      dispatch(setError('Screen sharing not supported or permission denied'));
    }
  };

  return {
    joinChannel,
    leaveChannel,
    toggleMuteAudio,
    toggleMuteVideo,
    toggleScreenShare: toggleScreenShareFunc
  };
};

// Room Setup Component
const RoomSetup = () => {
  const dispatch = useDispatch();
  const { roomId, userRole } = useSelector(state => state.consultation);
  const [tempRoomId, setTempRoomId] = useState(roomId);

  useEffect(() => {
    // Check URL parameters for room ID and role
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdFromUrl = urlParams.get('roomId');
    const roleFromUrl = urlParams.get('role');
    
    if (roomIdFromUrl) {
      dispatch(setRoomId(roomIdFromUrl));
      setTempRoomId(roomIdFromUrl);
    }
    if (roleFromUrl) {
      dispatch(setUserRole(roleFromUrl));
    }
  }, [dispatch]);

  const generateRoomId = () => {
    const newRoomId = Math.random().toString(36).substr(2, 9);
    setTempRoomId(newRoomId);
    dispatch(setRoomId(newRoomId));
  };

  const generateJoinLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?roomId=${roomId}&role=client`;
  };

  const openEmailInvite = () => {
    const joinLink = generateJoinLink();
    const subject = encodeURIComponent('Join Medical Consultation Call');
    const body = encodeURIComponent(
      `You've been invited to join a medical consultation call.\n\n` +
      `Click the link below to join:\n${joinLink}\n\n` +
      `Room ID: ${roomId}\n\n` +
      `Please ensure you have a stable internet connection and allow camera and microphone permissions when prompted.`
    );
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          {userRole === 'provider' ? 'Create Consultation Room' : 'Join Consultation'}
        </h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Room ID</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={tempRoomId}
                  onChange={(e) => setTempRoomId(e.target.value)}
                  placeholder="Enter or generate room ID"
                />
                {userRole === 'provider' && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={generateRoomId}
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={userRole}
                onChange={(e) => dispatch(setUserRole(e.target.value))}
              >
                <option value="provider">Provider (Host)</option>
                <option value="client">Client (Participant)</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => dispatch(setRoomId(tempRoomId))}
            disabled={!tempRoomId}
          >
            Set Room
          </button>
          
          {userRole === 'provider' && roomId && (
            <>
              <button
                className="btn btn-success"
                onClick={openEmailInvite}
              >
                📧 Email Invite
              </button>
              <button
                className="btn btn-info"
                onClick={() => dispatch(toggleInviteModal())}
              >
                📋 Show Link
              </button>
            </>
          )}
        </div>
        
        {roomId && (
          <div className="mt-3 p-2 bg-light rounded">
            <small>
              <strong>Current Room:</strong> {roomId} 
              <span className="badge bg-secondary ms-2">{userRole}</span>
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

// Video Controls Component
const VideoControls = () => {
  const dispatch = useDispatch();
  const { isJoined, isAudioMuted, isVideoMuted, isScreenSharing, isLoading } = useSelector(state => state.consultation);
  const { joinChannel, leaveChannel, toggleMuteAudio, toggleMuteVideo, toggleScreenShare } = useAgoraRTC();

  return (
    <div className="d-flex gap-2 justify-content-center">
      {!isJoined ? (
        <button
          className="btn btn-success btn-lg"
          onClick={joinChannel}
          disabled={isLoading}
        >
          {isLoading ? '⏳ Joining...' : '📹 Join Call'}
        </button>
      ) : (
        <>
          <button
            className="btn btn-danger"
            onClick={leaveChannel}
            disabled={isLoading}
          >
            📞 Leave
          </button>
          
          <button
            className={`btn ${isAudioMuted ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={toggleMuteAudio}
          >
            {isAudioMuted ? '🔇' : '🎤'}
          </button>
          
          <button
            className={`btn ${isVideoMuted ? 'btn-warning' : 'btn-outline-secondary'}`}
            onClick={toggleMuteVideo}
          >
            {isVideoMuted ? '📹' : '📽️'}
          </button>
          
          <button
            className={`btn ${isScreenSharing ? 'btn-info' : 'btn-outline-info'}`}
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? '🖥️ Stop' : '📺 Share'}
          </button>
        </>
      )}
    </div>
  );
};

// Video Grid Component
const VideoGrid = () => {
  const { participants, isJoined } = useSelector(state => state.consultation);

  if (!isJoined) {
    return (
      <div className="video-grid-placeholder">
        <div className="text-center text-muted p-5">
          <h4>Ready to Join</h4>
          <p>Click "Join Call" to start the consultation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-grid">
      {/* Local Video */}
      <div className="video-tile local-video">
        <div className="video-container">
          <div id="local-video" className="video-player"></div>
          <div className="video-overlay">
            <span className="badge bg-primary">You</span>
          </div>
        </div>
      </div>

      {/* Remote Videos */}
      {participants.map((participant) => (
        <div key={participant.uid} className="video-tile remote-video">
          <div className="video-container">
            <div id={`remote-video-${participant.uid}`} className="video-player"></div>
            <div className="video-overlay">
              <span className="badge bg-secondary">User {participant.uid}</span>
            </div>
          </div>
        </div>
      ))}
      
      {/* Placeholder tiles for empty slots */}
      {participants.length < 3 && Array.from({ length: 3 - participants.length }).map((_, index) => (
        <div key={`placeholder-${index}`} className="video-tile placeholder">
          <div className="video-container">
            <div className="video-player-placeholder d-flex align-items-center justify-content-center">
              <span className="text-muted">Waiting for participant...</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Invite Modal Component
const InviteModal = () => {
  const dispatch = useDispatch();
  const { roomId, showInviteModal } = useSelector(state => state.consultation);

  const generateJoinLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?roomId=${roomId}&role=client`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJoinLink());
    alert('Link copied to clipboard!');
  };

  if (!showInviteModal) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Share Consultation Link</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => dispatch(toggleInviteModal())}
            ></button>
          </div>
          <div className="modal-body">
            <p>Share this link with clients to join the consultation:</p>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={generateJoinLink()}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={copyToClipboard}
              >
                Copy
              </button>
            </div>
            <small className="text-muted mt-2 d-block">
              Room ID: <code>{roomId}</code>
            </small>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => dispatch(toggleInviteModal())}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal App Component (wrapped by Provider)
const ConsultationAppInternal = () => {
  const dispatch = useDispatch();
  const { error, userRole } = useSelector(state => state.consultation);

  return (
    <div className="consultation-app">
        <style>{`
          .consultation-app {
            min-height: 100vh;
            background: #f8f9fa;
          }
          
          .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            padding: 20px;
          }
          
          .video-grid-placeholder {
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e9ecef;
            border-radius: 10px;
            margin: 20px;
          }
          
          .video-tile {
            position: relative;
            background: #000;
            border-radius: 10px;
            overflow: hidden;
            aspect-ratio: 16/9;
            min-height: 200px;
          }
          
          .video-container {
            position: relative;
            width: 100%;
            height: 100%;
          }
          
          .video-player {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .video-player-placeholder {
            width: 100%;
            height: 100%;
            background: #dee2e6;
            border: 2px dashed #adb5bd;
          }
          
          .video-overlay {
            position: absolute;
            bottom: 10px;
            left: 10px;
          }
          
          .local-video {
            border: 3px solid #0d6efd;
          }
          
          .placeholder {
            opacity: 0.7;
          }
          
          .navbar {
            box-shadow: 0 2px 4px rgba(0,0,0,.1);
          }
          
          .alert-custom {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1050;
            max-width: 400px;
          }
        `}</style>

        {/* Navigation */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <div className="container">
            <span className="navbar-brand">
              🏥 Agora Med Care - Consultation Call
            </span>
            <span className="navbar-text">
              {userRole === 'provider' ? '👨‍⚕️ Provider' : '👤 Client'}
            </span>
          </div>
        </nav>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger alert-custom alert-dismissible">
            <strong>Error:</strong> {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => dispatch(setError(null))}
            ></button>
          </div>
        )}

        <div className="container-fluid py-4">
          {/* Room Setup */}
          <div className="row mb-4">
            <div className="col">
              <RoomSetup />
            </div>
          </div>

          {/* Video Controls */}
          <div className="row mb-4">
            <div className="col text-center">
              <VideoControls />
            </div>
          </div>

          {/* Video Grid */}
          <div className="row">
            <div className="col">
              <VideoGrid />
            </div>
          </div>
        </div>

        {/* Invite Modal */}
        <InviteModal />

        {/* Footer */}
        <footer className="bg-light text-center py-3 mt-5">
          <small className="text-muted">
            🔒 Replace AGORA_APP_ID and TEMP_TOKEN with real credentials for production use
          </small>
        </footer>
      </div>
  );
};

// Main Consultation App Component (with Provider)
const ConsultationApp = () => {
  return (
    <Provider store={store}>
      <ConsultationAppInternal />
    </Provider>
  );
};

export default ConsultationApp;