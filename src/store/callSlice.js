import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isProvider: false,
  currentUser: null,
  callSession: null,
  participants: [],
  isCallActive: false,
  localVideoTrack: null,
  localAudioTrack: null,
  remoteUsers: [],
  isMuted: false,
  isCameraOn: true,
  invitationEmail: '',
  callId: null,
  appId: process.env.REACT_APP_AGORA_APP_ID || 'demo-app-id', // Replace with actual Agora App ID
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setUserType: (state, action) => {
      state.isProvider = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    setCallSession: (state, action) => {
      state.callSession = action.payload;
    },
    addParticipant: (state, action) => {
      state.participants.push(action.payload);
    },
    removeParticipant: (state, action) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },
    setCallActive: (state, action) => {
      state.isCallActive = action.payload;
    },
    setLocalTracks: (state, action) => {
      const { videoTrack, audioTrack } = action.payload;
      state.localVideoTrack = videoTrack;
      state.localAudioTrack = audioTrack;
    },
    addRemoteUser: (state, action) => {
      const existingUser = state.remoteUsers.find(u => u.uid === action.payload.uid);
      if (!existingUser) {
        state.remoteUsers.push(action.payload);
      }
    },
    removeRemoteUser: (state, action) => {
      state.remoteUsers = state.remoteUsers.filter(u => u.uid !== action.payload);
    },
    updateRemoteUser: (state, action) => {
      const { uid, updates } = action.payload;
      const userIndex = state.remoteUsers.findIndex(u => u.uid === uid);
      if (userIndex !== -1) {
        state.remoteUsers[userIndex] = { ...state.remoteUsers[userIndex], ...updates };
      }
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleCamera: (state) => {
      state.isCameraOn = !state.isCameraOn;
    },
    setInvitationEmail: (state, action) => {
      state.invitationEmail = action.payload;
    },
    setCallId: (state, action) => {
      state.callId = action.payload;
    },
    resetCall: (state) => {
      state.isCallActive = false;
      state.participants = [];
      state.remoteUsers = [];
      state.localVideoTrack = null;
      state.localAudioTrack = null;
      state.callSession = null;
      state.isMuted = false;
      state.isCameraOn = true;
    },
  },
});

export const {
  setUserType,
  setCurrentUser,
  setCallSession,
  addParticipant,
  removeParticipant,
  setCallActive,
  setLocalTracks,
  addRemoteUser,
  removeRemoteUser,
  updateRemoteUser,
  toggleMute,
  toggleCamera,
  setInvitationEmail,
  setCallId,
  resetCall,
} = callSlice.actions;

export default callSlice.reducer;