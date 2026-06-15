const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const templates = {
  welcome: ({ name, verifyUrl }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff5f7;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white; font-size: 28px; margin: 0;">🌸 Lily's Lab</h1>
          <p style="color: #fce7f3; margin: 8px 0 0;">Handmade Floral Creations Made With Love</p>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #9d174d; font-size: 22px;">Welcome, ${name}! 🌷</h2>
          <p style="color: #6b7280; line-height: 1.6;">We're so glad you've joined our floral family! Browse our handmade creations and find something beautiful just for you.</p>
          <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #f9a8d4, #c084fc); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold; margin: 20px 0;">Verify My Email</a>
          <p style="color: #9ca3af; font-size: 12px;">This link expires in 24 hours.</p>
        </div>
      </div>
    `
  }),
  
  orderConfirmation: ({ name, orderNumber, totalAmount }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white;">🌸 Order Confirmed!</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="color: #9d174d;">Thank you, ${name}! 🌹</h2>
          <p>Your order <strong>#${orderNumber}</strong> has been confirmed.</p>
          <p>Total: <strong>₹${totalAmount}</strong></p>
          <p>We'll start preparing your beautiful floral creation right away! ✨</p>
        </div>
      </div>
    `
  }),
  
  orderStatus: ({ name, orderNumber, status, note }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white;">🌸 Order Update</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${name},</p>
          <p>Your order <strong>#${orderNumber}</strong> status has been updated to: <strong>${status.toUpperCase()}</strong></p>
          ${note ? `<p>${note}</p>` : ''}
        </div>
      </div>
    `
  }),
  
  resetPassword: ({ name, resetUrl }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white;">🌸 Password Reset</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${name},</p>
          <p>Click below to reset your password. This link expires in 10 minutes.</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f9a8d4, #c084fc); color: white; padding: 14px 32px; border-radius: 25px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
      </div>
    `
  }),
  
  newCustomOrder: ({ order }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white;">🌸 New Custom Order!</h1>
        </div>
        <div style="padding: 40px;">
          <p>Order #: <strong>${order.orderNumber}</strong></p>
          <p>Customer: ${order.customerName}</p>
          <p>Email: ${order.email}</p>
          <p>Phone: ${order.phone}</p>
          <p>Occasion: ${order.occasion}</p>
          <p>Delivery Date: ${new Date(order.deliveryDate).toLocaleDateString('en-IN')}</p>
          ${order.notes ? `<p>Notes: ${order.notes}</p>` : ''}
        </div>
      </div>
    `
  }),
  
  customOrderConfirmation: ({ name, orderNumber }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white;">🌸 Custom Order Received!</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${name}! 🌷</p>
          <p>We've received your custom order <strong>#${orderNumber}</strong>.</p>
          <p>Our team will review your request and get back to you within 24 hours with a quote.</p>
          <p>Thank you for choosing Lily's Lab! ✨</p>
        </div>
      </div>
    `
  }),
  
  customOrderStatus: ({ name, orderNumber, status, quotedPrice, adminNotes }) => ({
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f9a8d4, #c084fc); padding: 40px; text-align: center;">
          <h1 style="color: white;">🌸 Custom Order Update</h1>
        </div>
        <div style="padding: 40px;">
          <p>Hi ${name},</p>
          <p>Your custom order <strong>#${orderNumber}</strong> has been updated.</p>
          <p>Status: <strong>${status}</strong></p>
          ${quotedPrice ? `<p>Quoted Price: <strong>₹${quotedPrice}</strong></p>` : ''}
          ${adminNotes ? `<p>Message from us: ${adminNotes}</p>` : ''}
        </div>
      </div>
    `
  })
};

exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templateContent = templates[template] ? templates[template](data) : { html: `<p>${JSON.stringify(data)}</p>` };
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: templateContent.html
    });
    
    console.log(`✉️ Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};