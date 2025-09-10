import AgoraRTC from 'agora-rtc-sdk-ng';

class AgoraService {
  constructor() {
    this.client = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.remoteUsers = {};
    this.appId = ''; // This should be set from Redux store or config
  }

  async initializeClient(appId) {
    try {
      this.appId = appId;
      this.client = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8',
      });

      // Set up event listeners
      this.client.on('user-published', this.handleUserPublished.bind(this));
      this.client.on('user-unpublished', this.handleUserUnpublished.bind(this));
      this.client.on('user-joined', this.handleUserJoined.bind(this));
      this.client.on('user-left', this.handleUserLeft.bind(this));
      
      return true;
    } catch (error) {
      console.error('Error initializing Agora client:', error);
      return false;
    }
  }

  async joinChannel(channelName, token, uid, onUserUpdate) {
    try {
      this.onUserUpdate = onUserUpdate;
      
      // Join the channel
      await this.client.join(this.appId, channelName, token, uid);
      
      // Create local tracks
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      this.localVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p_2',
      });

      // Publish local tracks
      await this.client.publish([this.localAudioTrack, this.localVideoTrack]);

      return {
        audioTrack: this.localAudioTrack,
        videoTrack: this.localVideoTrack,
      };
    } catch (error) {
      console.error('Error joining channel:', error);
      throw error;
    }
  }

  async leaveChannel() {
    try {
      // Clean up local tracks
      if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
      }
      if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
      }

      // Clean up remote users
      this.remoteUsers = {};

      // Leave the channel
      if (this.client) {
        await this.client.leave();
      }
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  }

  async toggleMicrophone(enabled) {
    if (this.localAudioTrack) {
      await this.localAudioTrack.setEnabled(enabled);
    }
  }

  async toggleCamera(enabled) {
    if (this.localVideoTrack) {
      await this.localVideoTrack.setEnabled(enabled);
    }
  }

  playLocalVideo(elementId) {
    if (this.localVideoTrack && elementId) {
      this.localVideoTrack.play(elementId);
    }
  }

  playRemoteVideo(uid, elementId) {
    const remoteUser = this.remoteUsers[uid];
    if (remoteUser && remoteUser.videoTrack && elementId) {
      remoteUser.videoTrack.play(elementId);
    }
  }

  handleUserPublished(user, mediaType) {
    console.log('User published:', user.uid, mediaType);
    
    this.client.subscribe(user, mediaType).then(() => {
      if (!this.remoteUsers[user.uid]) {
        this.remoteUsers[user.uid] = { uid: user.uid };
      }

      if (mediaType === 'video') {
        this.remoteUsers[user.uid].videoTrack = user.videoTrack;
      } else if (mediaType === 'audio') {
        this.remoteUsers[user.uid].audioTrack = user.audioTrack;
        user.audioTrack.play();
      }

      // Notify the component about the update
      if (this.onUserUpdate) {
        this.onUserUpdate('user-published', { uid: user.uid, mediaType });
      }
    });
  }

  handleUserUnpublished(user, mediaType) {
    console.log('User unpublished:', user.uid, mediaType);
    
    if (this.remoteUsers[user.uid]) {
      if (mediaType === 'video') {
        this.remoteUsers[user.uid].videoTrack = null;
      } else if (mediaType === 'audio') {
        this.remoteUsers[user.uid].audioTrack = null;
      }
    }

    if (this.onUserUpdate) {
      this.onUserUpdate('user-unpublished', { uid: user.uid, mediaType });
    }
  }

  handleUserJoined(user) {
    console.log('User joined:', user.uid);
    this.remoteUsers[user.uid] = { uid: user.uid };

    if (this.onUserUpdate) {
      this.onUserUpdate('user-joined', { uid: user.uid });
    }
  }

  handleUserLeft(user) {
    console.log('User left:', user.uid);
    delete this.remoteUsers[user.uid];

    if (this.onUserUpdate) {
      this.onUserUpdate('user-left', { uid: user.uid });
    }
  }

  getRemoteUsers() {
    return Object.values(this.remoteUsers);
  }
}

// Export singleton instance
const agoraService = new AgoraService();
export default agoraService;