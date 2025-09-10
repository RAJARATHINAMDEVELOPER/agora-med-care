import { configureStore } from '@reduxjs/toolkit';
import callReducer from './callSlice';

export const store = configureStore({
  reducer: {
    call: callReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['call/setLocalTracks', 'call/setCallSession'],
        ignoredPaths: ['call.localVideoTrack', 'call.localAudioTrack', 'call.callSession'],
      },
    }),
});

export default store;