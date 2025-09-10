import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMute, toggleCamera } from '../store/callSlice';
import agoraService from '../services/agoraService';

const VideoCallInterface = () => {
  const dispatch = useDispatch();
  const { 
    localVideoTrack, 
    localAudioTrack, 
    remoteUsers, 
    isMuted, 
    isCameraOn,
    isProvider
  } = useSelector(state => state.call);

  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Play local video
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current.id);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    // Play remote videos
    remoteUsers.forEach(user => {
      if (user.uid && remoteVideoRefs.current[user.uid]) {
        agoraService.playRemoteVideo(user.uid, remoteVideoRefs.current[user.uid].id);
      }
    });
  }, [remoteUsers]);

  const handleMuteToggle = async () => {
    try {
      const newMutedState = !isMuted;
      await agoraService.toggleMicrophone(!newMutedState);
      dispatch(toggleMute());
    } catch (error) {
      console.error('Error toggling microphone:', error);
    }
  };

  const handleCameraToggle = async () => {
    try {
      const newCameraState = !isCameraOn;
      await agoraService.toggleCamera(newCameraState);
      dispatch(toggleCamera());
    } catch (error) {
      console.error('Error toggling camera:', error);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getVideoGridClass = () => {
    const totalParticipants = remoteUsers.length + 1; // +1 for local user
    if (totalParticipants === 1) return 'video-grid single';
    if (totalParticipants === 2) return 'video-grid dual';
    if (totalParticipants <= 4) return 'video-grid quad';
    return 'video-grid multi';
  };

  return (
    <div className="video-call-container">
      <div className={getVideoGridClass()}>
        {/* Local Video */}
        <div className="video-participant local-video">
          <div 
            ref={localVideoRef}
            id="local-video"
            className="video-element"
            style={{ width: '100%', height: '100%', background: '#2a2a2a' }}
          >
            {!isCameraOn && (
              <div className="camera-off-placeholder">
                <i className="fas fa-video-slash fa-3x text-white opacity-50"></i>
                <p className="text-white mt-2">Camera Off</p>
              </div>
            )}
          </div>
          
          <div className="participant-overlay">
            <div className="participant-info">
              <span className="participant-name">You</span>
              <span className="participant-role">
                {isProvider ? '(Provider)' : '(Patient)'}
              </span>
            </div>
            <div className="participant-status">
              <div className={`status-indicator ${isMuted ? 'muted' : ''}`} title={isMuted ? 'Muted' : 'Audio On'}></div>
              <div className={`status-indicator ${!isCameraOn ? 'muted' : ''}`} title={isCameraOn ? 'Camera On' : 'Camera Off'}></div>
            </div>
          </div>
        </div>

        {/* Remote Users */}
        {remoteUsers.map((user, index) => (
          <div key={user.uid} className="video-participant remote-video">
            <div 
              ref={el => remoteVideoRefs.current[user.uid] = el}
              id={`remote-video-${user.uid}`}
              className="video-element"
              style={{ width: '100%', height: '100%', background: '#2a2a2a' }}
            >
              {!user.hasVideo && (
                <div className="camera-off-placeholder">
                  <i className="fas fa-user-circle fa-3x text-white opacity-50"></i>
                  <p className="text-white mt-2">
                    {isProvider ? `Patient ${index + 1}` : 'Healthcare Provider'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="participant-overlay">
              <div className="participant-info">
                <span className="participant-name">
                  {isProvider ? `Patient ${index + 1}` : 'Healthcare Provider'}
                </span>
              </div>
              <div className="participant-status">
                <div className={`status-indicator ${!user.hasAudio ? 'muted' : ''}`} title={user.hasAudio ? 'Audio On' : 'Muted'}></div>
                <div className={`status-indicator ${!user.hasVideo ? 'muted' : ''}`} title={user.hasVideo ? 'Camera On' : 'Camera Off'}></div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty slots for better grid layout */}
        {remoteUsers.length === 0 && (
          <div className="video-participant empty-slot">
            <div className="waiting-for-participants">
              <i className="fas fa-clock fa-2x text-white opacity-50"></i>
              <p className="text-white mt-2">
                {isProvider ? 'Waiting for patients to join...' : 'Connecting to healthcare provider...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Call Controls */}
      <div className="call-controls-bar">
        <button 
          className={`control-btn mute-btn ${isMuted ? 'active' : ''}`}
          onClick={handleMuteToggle}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
        </button>

        <button 
          className={`control-btn camera-btn ${!isCameraOn ? 'active' : ''}`}
          onClick={handleCameraToggle}
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          <i className={`fas ${isCameraOn ? 'fa-video' : 'fa-video-slash'}`}></i>
        </button>

        <button 
          className="control-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
        </button>

        <button 
          className="control-btn leave-btn"
          onClick={() => window.location.reload()}
          title="Leave call"
        >
          <i className="fas fa-phone-slash"></i>
        </button>
      </div>

      {/* Call Info Overlay */}
      <div className="call-info-overlay">
        <div className="call-duration">
          <i className="fas fa-clock me-1"></i>
          <span id="call-duration">00:00</span>
        </div>
        
        <div className="connection-quality">
          <i className="fas fa-signal text-success"></i>
          <span className="ms-1 text-success small">Good</span>
        </div>
      </div>

      {/* Chat Panel (Optional - for future enhancement) */}
      {/* <div className="chat-panel">
        <div className="chat-header">
          <h6>Chat</h6>
          <button className="btn btn-sm">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="chat-messages">
          <!-- Chat messages would go here -->
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Type a message..." />
          <button><i className="fas fa-paper-plane"></i></button>
        </div>
      </div> */}
    </div>
  );
};

export default VideoCallInterface;