# Agora Med Care - Consultation Call

A single-file React + Redux Toolkit demo application for group consultation video calls between healthcare providers and multiple clients, built with Agora Web SDK.

## 🏥 Features

### Core Functionality
- **Provider/Client Roles**: Providers can create rooms, clients can join via invitation links
- **Room Management**: Generate unique room IDs and share join links
- **Video Calling**: Real-time audio/video communication using Agora Web SDK
- **Email Invitations**: One-click email invites with prefilled consultation details
- **URL-based Joining**: Direct room access via URL parameters
- **Responsive Design**: Bootstrap-powered interface that works on all devices

### Video Call Features
- Join/Leave video calls
- Local video preview
- Remote participant video rendering
- Audio mute/unmute controls
- Video mute/unmute controls
- Screen sharing capability (when supported)
- Automatic participant management

### State Management
- Redux Toolkit for centralized state management
- Real-time participant tracking
- UI state management (loading, errors, modals)
- Role-based feature access

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Valid Agora.io account and credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RAJARATHINAM-S/agora-med-care.git
   cd agora-med-care
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Agora Credentials**
   
   Open `src/ConsultationApp.js` and replace the placeholder credentials:
   
   ```javascript
   // PLACEHOLDER CREDENTIALS - Replace with your actual Agora credentials
   const AGORA_APP_ID = 'YOUR_ACTUAL_APP_ID_HERE';
   const TEMP_TOKEN = 'YOUR_ACTUAL_TOKEN_HERE';
   ```
   
   **Getting Agora Credentials:**
   - Sign up at [Agora.io](https://www.agora.io/)
   - Create a new project in the Agora Console
   - Copy your App ID
   - Generate a temporary token or set up token server for production

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open the application**
   - Navigate to `http://localhost:3000`
   - The app will open in your default browser

## 📱 How to Use

### For Providers (Healthcare Professionals)

1. **Create a Consultation Room**
   - Open the application
   - Ensure "Provider (Host)" is selected as the role
   - Click "Generate" to create a unique room ID
   - Click "Set Room" to confirm

2. **Invite Clients**
   - Click "📧 Email Invite" to open your email client with a prefilled invitation
   - Or click "📋 Show Link" to copy the join link manually
   - Share the link with clients who need to join the consultation

3. **Start the Consultation**
   - Click "📹 Join Call" to enter the video call
   - Use the control buttons to mute/unmute audio/video
   - Click "📺 Share" to share your screen (if needed)

### For Clients (Patients)

1. **Join via Invitation Link**
   - Click the invitation link received from your provider
   - The room ID and client role will be set automatically

2. **Manual Join**
   - Enter the room ID provided by your healthcare provider
   - Select "Client (Participant)" as the role
   - Click "Set Room"

3. **Join the Consultation**
   - Click "📹 Join Call" to enter the video call
   - Allow camera and microphone permissions when prompted
   - Use the control buttons as needed during the consultation

## 🛠️ Technical Architecture

### Single-File Structure
The entire application is contained in `src/ConsultationApp.js` for easy deployment and demonstration purposes.

### Key Components
- **ConsultationApp**: Main wrapper component with Redux Provider
- **ConsultationAppInternal**: Core application logic and UI
- **RoomSetup**: Room creation and joining interface
- **VideoControls**: Call control buttons (join, leave, mute, etc.)
- **VideoGrid**: Video display grid for local and remote participants
- **InviteModal**: Share invitation links modal

### State Management
```javascript
// Redux store structure
{
  consultation: {
    roomId: string,
    userRole: 'provider' | 'client',
    isJoined: boolean,
    localTracks: {
      videoTrack: MediaStreamTrack,
      audioTrack: MediaStreamTrack,
      screenTrack: MediaStreamTrack
    },
    participants: Array<Participant>,
    isAudioMuted: boolean,
    isVideoMuted: boolean,
    isScreenSharing: boolean,
    isLoading: boolean,
    error: string | null,
    showInviteModal: boolean
  }
}
```

### Agora Integration
- Uses `agora-rtc-sdk-ng` for WebRTC functionality
- Handles user events (join, leave, publish, unpublish)
- Manages audio/video tracks and screen sharing
- Provides error handling and logging

## 🔧 Configuration

### Environment Setup
The application uses placeholder credentials that must be replaced:

```javascript
// Replace these in src/ConsultationApp.js
const AGORA_APP_ID = 'YOUR_APP_ID_HERE';
const TEMP_TOKEN = 'YOUR_TEMP_TOKEN_HERE';
```

### Production Considerations

1. **Token Server**: Replace `TEMP_TOKEN` with a proper token server implementation
2. **Security**: Implement proper authentication and authorization
3. **Scalability**: Add participant limits and resource management
4. **Error Handling**: Enhance error messages for production use
5. **Logging**: Add proper logging for monitoring and debugging

## 🎨 Styling

The application uses:
- **Bootstrap 5.3.2**: For responsive layout and components
- **Custom CSS**: For video grid, overlays, and enhancements
- **Emoji Icons**: For intuitive user interface elements

## 🔒 Security Notes

⚠️ **Important**: This is a demo application with placeholder credentials. For production use:

- Never expose real Agora credentials in client-side code
- Implement proper token generation server-side
- Add user authentication and room access controls
- Use HTTPS in production
- Implement rate limiting and abuse prevention

## 📦 Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-scripts": "5.0.1",
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "agora-rtc-sdk-ng": "^4.19.3",
  "bootstrap": "^5.3.2"
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built files in the `build` folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:
- Create an issue in this repository
- Check [Agora.io documentation](https://docs.agora.io/)
- Review [React documentation](https://reactjs.org/docs/)

## 🔗 Links

- [Agora.io](https://www.agora.io/) - Real-time communication platform
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Bootstrap](https://getbootstrap.com/) - CSS framework

---

**Note**: Remember to replace placeholder credentials with real Agora credentials before using in production!
