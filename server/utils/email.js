import nodemailer from "nodemailer";
import "../config/env.js";

let transporter;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

function getAppName() {
  return process.env.APP_NAME || "ComplaintUs";
}

function getClientUrl(path = "") {
  const clientUrl = getRequiredEnv("CLIENT_URL").replace(/\/$/, "");
  return `${clientUrl}${path}`;
}

function getFromEmail() {
  return process.env.EMAIL_FROM || `"${getAppName()}" <${getRequiredEnv("GMAIL_USER")}>`;
}

// Create a reusable Gmail transporter using environment variables.
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: getRequiredEnv("GMAIL_USER"),
      pass: getRequiredEnv("GMAIL_APP_PASSWORD"),
    },
  });
}

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }

  return transporter;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML Email Templates
// ─────────────────────────────────────────────────────────────────────────────

const baseTemplate = (title, content) => {
  const appName = getAppName();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(to right, #34d399, #10b981); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; }
    .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; }
    .status-badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; margin: 10px 0; }
    .status-pending { background: #fef3c7; color: #b45309; }
    .status-in-progress { background: #e0f2fe; color: #0369a1; }
    .status-resolved { background: #d1fae5; color: #047857; }
    .detail-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .email-image { display: block; width: 100%; max-width: 520px; max-height: 320px; object-fit: cover; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 10px; }
    .btn { display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      This is an automated message from ${appName}.<br>
      Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Senders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Send an email when a complaint is first filed.
 */
export async function sendComplaintCreatedEmail(user, complaint) {
  if (!user || !user.email) return;
  const complaintsUrl = getClientUrl("/complaints");

  const html = baseTemplate(
    "Complaint Received",
    `
    <p>Hi ${user.name},</p>
    <p>We've successfully received your complaint and it is now pending review by our administration team.</p>
    
    <div class="detail-box">
      <p><strong>Complaint ID:</strong> #${complaint.complaint_id}</p>
      <p><strong>Title:</strong> ${complaint.title}</p>
      <p><strong>Category:</strong> ${complaint.category}</p>
      <p><strong>Priority:</strong> ${complaint.priority}</p>
      <br>
      <p><strong>Description:</strong><br>${complaint.description}</p>
      ${complaint.complaint_image ? `
        <p><strong>Attached Image:</strong></p>
        <a href="${complaint.complaint_image}">
          <img src="${complaint.complaint_image}" alt="Complaint attachment" class="email-image" width="520" style="display:block;width:100%;max-width:520px;max-height:320px;object-fit:cover;border-radius:10px;border:1px solid #e2e8f0;margin-top:10px;">
        </a>
      ` : ""}
    </div>

    <p>We'll notify you as soon as there's an update on your complaint.</p>
    <center>
      <a href="${complaintsUrl}" class="btn">View My Complaints</a>
    </center>
    `
  );

  try {
    await getTransporter().sendMail({
      from: getFromEmail(),
      to: user.email,
      subject: `Complaint Received: #${complaint.complaint_id} - ${complaint.title}`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send creation email to ${user.email}:`, error.message);
  }
}

/**
 * Send an email when a complaint's status changes.
 */
export async function sendComplaintStatusEmail(user, complaint, oldStatus) {
  if (!user || !user.email) return;
  // Don't send an email if the status didn't actually change
  if (oldStatus === complaint.status) return;
  const complaintsUrl = getClientUrl("/complaints");

  let statusClass = "status-pending";
  let statusText = "Pending";
  
  if (complaint.status === "in-progress") {
    statusClass = "status-in-progress";
    statusText = "In Progress";
  } else if (complaint.status === "resolved") {
    statusClass = "status-resolved";
    statusText = "Resolved";
  }

  const html = baseTemplate(
    "Complaint Status Updated",
    `
    <p>Hi ${user.name},</p>
    <p>There is an update regarding your complaint <strong>#${complaint.complaint_id}</strong>.</p>
    
    <center>
      <div class="status-badge ${statusClass}">
        Status: ${statusText}
      </div>
    </center>

    <div class="detail-box">
      <p><strong>Title:</strong> ${complaint.title}</p>
      ${complaint.assigned_to ? `<p><strong>Assigned To:</strong> ${complaint.assigned_to}</p>` : ''}
      ${complaint.complaint_image ? `
        <p><strong>Attached Image:</strong></p>
        <a href="${complaint.complaint_image}">
          <img src="${complaint.complaint_image}" alt="Complaint attachment" class="email-image" width="520" style="display:block;width:100%;max-width:520px;max-height:320px;object-fit:cover;border-radius:10px;border:1px solid #e2e8f0;margin-top:10px;">
        </a>
      ` : ""}
    </div>

    ${complaint.status === 'resolved' ? '<p>Your complaint has been marked as resolved. Thank you for making our campus better!</p>' : '<p>Our team is actively monitoring the situation.</p>'}
    
    <center>
      <a href="${complaintsUrl}" class="btn">View Details</a>
    </center>
    `
  );

  try {
    await getTransporter().sendMail({
      from: getFromEmail(),
      to: user.email,
      subject: `Update on Complaint #${complaint.complaint_id}: Marked as ${statusText}`,
      html,
    });
  } catch (error) {
    console.error(`[email] Failed to send status email to ${user.email}:`, error.message);
  }
}
