const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `Blood Management System <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Welcome email for new users
  welcome: (user) => ({
    subject: 'Welcome to Blood Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Welcome to Blood Management System</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for registering with our Blood Management System. Your account has been created successfully.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <p><strong>Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          <p><strong>Blood Group:</strong> ${user.bloodGroup}</p>
        </div>
        <p>You can now log in to your account and start using our services.</p>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>Blood Management System Team</p>
      </div>
    `
  }),

  // Email verification
  verification: (user, token) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Email Verification Required</h2>
        <p>Dear ${user.name},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${process.env.FRONTEND_URL}/verify-email?token=${token}</p>
        <p>This verification link will expire in 24 hours.</p>
        <p>Best regards,<br>Blood Management System Team</p>
      </div>
    `
  }),

  // Donation approval notification
  donationApproved: (donation, donor) => ({
    subject: 'Blood Donation Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Donation Approved!</h2>
        <p>Dear ${donor.name},</p>
        <p>Great news! Your blood donation has been approved and added to our inventory.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3>Donation Details:</h3>
          <p><strong>Blood Group:</strong> ${donation.bloodGroup}</p>
          <p><strong>Quantity:</strong> ${donation.quantity}ml</p>
          <p><strong>Donation Date:</strong> ${new Date(donation.donationDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> ${donation.location.center}</p>
        </div>
        <p>Thank you for your generous contribution to saving lives. Your donation can help up to 3 patients in need.</p>
        <p>You can donate again after 8 weeks (56 days).</p>
        <p>Best regards,<br>Blood Management System Team</p>
      </div>
    `
  }),

  // Blood request approval
  requestApproved: (request, requester) => ({
    subject: 'Blood Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Blood Request Approved</h2>
        <p>Dear ${requester.name},</p>
        <p>Your blood request has been approved and we are working to fulfill it.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3>Request Details:</h3>
          <p><strong>Patient:</strong> ${request.patient.name}</p>
          <p><strong>Blood Type:</strong> ${request.bloodType}</p>
          <p><strong>Quantity:</strong> ${request.quantity} units</p>
          <p><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
          <p><strong>Required By:</strong> ${new Date(request.requiredBy).toLocaleDateString()}</p>
          <p><strong>Hospital:</strong> ${request.hospital.name}</p>
        </div>
        <p>We will notify you as soon as blood units are available and ready for collection.</p>
        <p>Best regards,<br>Blood Management System Team</p>
      </div>
    `
  }),

  // Blood request fulfilled
  requestFulfilled: (request, requester) => ({
    subject: 'Blood Request Fulfilled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Blood Request Fulfilled</h2>
        <p>Dear ${requester.name},</p>
        <p>Excellent news! Your blood request has been fulfilled and is ready for collection.</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3>Fulfillment Details:</h3>
          <p><strong>Patient:</strong> ${request.patient.name}</p>
          <p><strong>Blood Type:</strong> ${request.bloodType}</p>
          <p><strong>Units Provided:</strong> ${request.fulfillment.unitsProvided} units</p>
          <p><strong>Hospital:</strong> ${request.hospital.name}</p>
          <p><strong>Contact:</strong> ${request.hospital.contactNumber}</p>
        </div>
        <p>Please coordinate with the hospital for blood collection as soon as possible.</p>
        <p>Best regards,<br>Blood Management System Team</p>
      </div>
    `
  }),

  // Low stock alert for admins
  lowStockAlert: (bloodGroup, currentStock, threshold) => ({
    subject: `Low Stock Alert - ${bloodGroup} Blood`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Low Stock Alert</h2>
        <p>Dear Administrator,</p>
        <p>This is an urgent notification about low blood stock levels.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3>Stock Alert Details:</h3>
          <p><strong>Blood Group:</strong> ${bloodGroup}</p>
          <p><strong>Current Stock:</strong> ${currentStock} units</p>
          <p><strong>Threshold:</strong> ${threshold} units</p>
          <p><strong>Status:</strong> ${currentStock <= threshold/2 ? 'CRITICAL' : 'LOW'}</p>
        </div>
        <p>Immediate action is required to replenish stock levels. Consider:</p>
        <ul>
          <li>Organizing donation drives</li>
          <li>Contacting regular donors</li>
          <li>Coordinating with other blood banks</li>
        </ul>
        <p>Best regards,<br>Blood Management System</p>
      </div>
    `
  }),

  // Password reset
  passwordReset: (user, token) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>Dear ${user.name},</p>
        <p>You have requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>This reset link will expire in 1 hour.</p>
        <p>Best regards,<br>Blood Management System Team</p>
      </div>
    `
  })
};

// Send specific email types
const sendWelcomeEmail = async (user) => {
  const template = emailTemplates.welcome(user);
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

const sendVerificationEmail = async (user, token) => {
  const template = emailTemplates.verification(user, token);
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

const sendDonationApprovedEmail = async (donation, donor) => {
  const template = emailTemplates.donationApproved(donation, donor);
  return await sendEmail({
    email: donor.email,
    subject: template.subject,
    html: template.html
  });
};

const sendRequestApprovedEmail = async (request, requester) => {
  const template = emailTemplates.requestApproved(request, requester);
  return await sendEmail({
    email: requester.email,
    subject: template.subject,
    html: template.html
  });
};

const sendRequestFulfilledEmail = async (request, requester) => {
  const template = emailTemplates.requestFulfilled(request, requester);
  return await sendEmail({
    email: requester.email,
    subject: template.subject,
    html: template.html
  });
};

const sendLowStockAlert = async (adminEmails, bloodGroup, currentStock, threshold) => {
  const template = emailTemplates.lowStockAlert(bloodGroup, currentStock, threshold);
  
  const promises = adminEmails.map(email => 
    sendEmail({
      email,
      subject: template.subject,
      html: template.html
    })
  );
  
  return await Promise.allSettled(promises);
};

const sendPasswordResetEmail = async (user, token) => {
  const template = emailTemplates.passwordReset(user, token);
  return await sendEmail({
    email: user.email,
    subject: template.subject,
    html: template.html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendDonationApprovedEmail,
  sendRequestApprovedEmail,
  sendRequestFulfilledEmail,
  sendLowStockAlert,
  sendPasswordResetEmail
};

