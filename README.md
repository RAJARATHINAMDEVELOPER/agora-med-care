# Agora Med Care - Medical Consultation Platform

A secure, professional medical consultation platform built with React, Redux, and Agora SDK for high-quality video conferencing between healthcare providers and patients.

## Features

### 🏥 For Healthcare Providers
- **Start Consultations**: Create secure video call sessions
- **Send Invitations**: Email patients with consultation links
- **Manage Sessions**: Control call settings and participant management
- **Professional Interface**: Clean, medical-focused UI design

### 👥 For Patients
- **Join via Email**: Click invitation links to join consultations
- **Easy Access**: Simple interface with Call ID entry
- **Secure Connection**: HIPAA-compliant video conferencing
- **Cross-Platform**: Works on desktop, tablet, and mobile devices

### 🚀 Technical Features
- **Real-time Video/Audio**: Powered by Agora SDK
- **State Management**: Redux for efficient data handling
- **Responsive Design**: Bootstrap-based responsive UI
- **Email Integration**: Automated invitation system
- **Security**: End-to-end encrypted communications

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Agora.io account for App ID

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agora-med-care
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Agora SDK**
   - Sign up at [Agora.io](https://agora.io)
   - Create a new project and get your App ID
   - Update the App ID in `src/store/callSlice.js` or use environment variables

4. **Set up environment variables** (optional)
   Create a `.env` file in the root directory:
   ```
   REACT_APP_AGORA_APP_ID=your-actual-agora-app-id
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### For Healthcare Providers

1. **Access the Platform**
   - Navigate to the application URL
   - Select "Healthcare Provider"

2. **Start a Consultation**
   - Click "Start Call" to begin a session
   - Copy the generated Call ID
   - Share with patients or send email invitations

3. **Send Email Invitations**
   - Enter patient's email address
   - Set appointment time
   - Click "Send Invitation"
   - Patient receives email with join link

### For Patients

1. **Join from Email Invitation**
   - Click the link in the invitation email
   - Enter your name when prompted
   - Join the consultation automatically

2. **Manual Join**
   - Navigate to the application URL
   - Select "Patient"
   - Enter your name and the Call ID provided by your doctor
   - Click "Join Consultation"

## Architecture

### Frontend Technologies
- **React 18**: Modern React with hooks
- **Redux Toolkit**: State management
- **Bootstrap 5**: Responsive CSS framework
- **Agora SDK**: Real-time communication
- **Webpack**: Module bundling and development server

### File Structure
```
src/
├── components/           # React components
│   ├── UserTypeSelector.js
│   ├── ProviderDashboard.js
│   ├── ClientInterface.js
│   └── VideoCallInterface.js
├── services/            # External service integrations
│   ├── agoraService.js  # Agora SDK wrapper
│   └── emailService.js  # Email invitation service
├── store/              # Redux store
│   ├── index.js        # Store configuration
│   └── callSlice.js    # Call state management
├── styles/             # CSS styles
│   └── main.css        # Main stylesheet
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Customization

### Styling
- Modify `src/styles/main.css` for custom styling
- CSS variables available for easy theme customization
- Bootstrap classes for rapid UI development

### Agora Configuration
- Update `src/services/agoraService.js` for custom video settings
- Modify encoding settings for bandwidth optimization
- Add additional Agora features as needed

### Email Templates
- Customize email templates in `src/services/emailService.js`
- Add branding and custom messaging
- Integrate with your email service provider

## Security Considerations

1. **Agora App ID**: Keep your App ID secure and use environment variables
2. **Token Authentication**: Implement server-side token generation for production
3. **HTTPS**: Always use HTTPS in production
4. **Data Privacy**: Ensure compliance with HIPAA and other regulations

## Troubleshooting

### Common Issues

1. **Camera/Microphone Permissions**
   - Ensure browser permissions are granted
   - Use HTTPS for production deployment

2. **Connection Issues**
   - Check network connectivity
   - Verify Agora App ID configuration
   - Test with different browsers

3. **Audio/Video Quality**
   - Check bandwidth requirements
   - Adjust Agora encoding settings
   - Optimize network conditions

### Browser Support
- Chrome 58+ (recommended)
- Firefox 56+
- Safari 11+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Check the troubleshooting guide above
- Review Agora SDK documentation
- Contact the development team

---

**Note**: This is a medical consultation platform. Ensure compliance with all relevant healthcare regulations and privacy laws in your jurisdiction before deployment.
