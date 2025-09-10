// Email service for sending consultation invitations
// Note: In a real application, this would be handled by a backend service

class EmailService {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  generateInvitationLink(callId, userType = 'client') {
    return `${this.baseUrl}?callId=${callId}&userType=${userType}`;
  }

  generateInvitationTemplate(providerName, appointmentTime, callId) {
    const joinLink = this.generateInvitationLink(callId);
    
    return {
      subject: `Medical Consultation Invitation - ${providerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">Medical Consultation Invitation</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Agora Med Care Platform</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">You're Invited to a Medical Consultation</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <p><strong>Healthcare Provider:</strong> ${providerName}</p>
              <p><strong>Scheduled Time:</strong> ${appointmentTime}</p>
              <p><strong>Call ID:</strong> ${callId}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${joinLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                Join Consultation Call
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">Before joining the call:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Ensure you have a stable internet connection</li>
                <li>Test your camera and microphone</li>
                <li>Find a quiet, well-lit space</li>
                <li>Have your medical history and current medications ready</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
              <p>If you're unable to join using the button above, copy and paste this link into your browser:</p>
              <p style="background: #e9ecef; padding: 10px; border-radius: 5px; word-break: break-all;">${joinLink}</p>
              <p style="margin-top: 20px;">For technical support, please contact our help desk.</p>
            </div>
          </div>
        </div>
      `,
      text: `
        Medical Consultation Invitation
        
        Healthcare Provider: ${providerName}
        Scheduled Time: ${appointmentTime}
        Call ID: ${callId}
        
        Join the consultation by clicking this link: ${joinLink}
        
        Before joining the call:
        - Ensure you have a stable internet connection
        - Test your camera and microphone
        - Find a quiet, well-lit space
        - Have your medical history and current medications ready
        
        If you have any technical issues, please contact our support team.
      `
    };
  }

  // In a real application, this would make an API call to your backend
  async sendInvitation(email, providerName, appointmentTime, callId) {
    try {
      const invitation = this.generateInvitationTemplate(providerName, appointmentTime, callId);
      
      // This is a mock implementation
      // In production, you would call your backend API:
      // const response = await fetch('/api/send-invitation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, ...invitation })
      // });
      
      // For demo purposes, we'll just log the invitation
      console.log('Email Invitation:', {
        to: email,
        subject: invitation.subject,
        body: invitation.html
      });

      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Invitation sent successfully',
            invitationLink: this.generateInvitationLink(callId)
          });
        }, 1000);
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw new Error('Failed to send invitation');
    }
  }

  // Parse URL parameters to check for invitation data
  parseInvitationFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const callId = urlParams.get('callId');
    const userType = urlParams.get('userType') || 'client';
    
    if (callId) {
      return { callId, userType };
    }
    
    return null;
  }
}

const emailService = new EmailService();
export default emailService;