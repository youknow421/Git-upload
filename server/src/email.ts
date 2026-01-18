export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'


export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log('\n📧 ═══════════════════════════════════════')
  console.log('   EMAIL SENT (Mock)')
  console.log('═══════════════════════════════════════════')
  console.log(`To: ${options.to}`)
  console.log(`Subject: ${options.subject}`)
  console.log('───────────────────────────────────────────')
  console.log(options.text || options.html.replace(/<[^>]*>/g, ''))
  console.log('═══════════════════════════════════════════\n')
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return true
}

export async function sendVerificationEmail(email: string, token: string, name: string): Promise<boolean> {
  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${name}!</h1>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 24 hours.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
Welcome, ${name}!

Thank you for registering. Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.
    `.trim()
  })
}

export async function sendPasswordResetEmail(email: string, token: string, name: string): Promise<boolean> {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`
  
  return sendEmail({
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link will expire in 1 hour.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
Hi ${name},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
    `.trim()
  })
}

// Order confirmation email
export async function sendOrderConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  total: number
): Promise<boolean> {
  const orderUrl = `${FRONTEND_URL}/orders/${orderNumber}`
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(2)}</td>
    </tr>
  `).join('')

  const itemsText = items.map(item => 
    `- ${item.name} x${item.quantity}: $${item.price.toFixed(2)}`
  ).join('\n')

  return sendEmail({
    to: email,
    subject: `Order Confirmed - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Thanks for your order!</h1>
        <p>Hi ${name},</p>
        <p>Your order <strong>#${orderNumber}</strong> has been confirmed and is being processed.</p>
        
        <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid #ddd;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 10px; font-weight: bold;">Total</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px;">$${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${orderUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Order
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          We'll send you another email when your order ships.
        </p>
      </div>
    `,
    text: `
Thanks for your order, ${name}!

Order #${orderNumber} has been confirmed.

Items:
${itemsText}

Total: $${total.toFixed(2)}

View your order: ${orderUrl}

We'll send you another email when your order ships.
    `.trim()
  })
}

// Order shipped email
export async function sendOrderShippedEmail(
  email: string,
  name: string,
  orderNumber: string,
  trackingNumber?: string
): Promise<boolean> {
  const orderUrl = `${FRONTEND_URL}/orders/${orderNumber}`
  
  return sendEmail({
    to: email,
    subject: `Your order is on its way! - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your order has shipped!</h1>
        <p>Hi ${name},</p>
        <p>Great news! Your order <strong>#${orderNumber}</strong> is on its way.</p>
        
        ${trackingNumber ? `
          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Tracking Number:</p>
            <p style="margin: 5px 0 0; font-size: 18px; font-family: monospace;">${trackingNumber}</p>
          </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${orderUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Track Order
          </a>
        </div>
      </div>
    `,
    text: `
Hi ${name},

Great news! Your order #${orderNumber} has shipped.

${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}

Track your order: ${orderUrl}
    `.trim()
  })
}

// Order delivered email
export async function sendOrderDeliveredEmail(
  email: string,
  name: string,
  orderNumber: string
): Promise<boolean> {
  const reviewUrl = `${FRONTEND_URL}/orders/${orderNumber}?review=true`
  
  return sendEmail({
    to: email,
    subject: `Order delivered! - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your order has been delivered!</h1>
        <p>Hi ${name},</p>
        <p>Your order <strong>#${orderNumber}</strong> has been delivered.</p>
        <p>We hope you love your purchase! If you have any questions, feel free to reach out.</p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${reviewUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Leave a Review
          </a>
        </div>
      </div>
    `,
    text: `
Hi ${name},

Your order #${orderNumber} has been delivered.

We hope you love your purchase!

Leave a review: ${reviewUrl}
    `.trim()
  })
}

// Payment failed email
export async function sendPaymentFailedEmail(
  email: string,
  name: string,
  orderNumber: string,
  reason: string
): Promise<boolean> {
  const retryUrl = `${FRONTEND_URL}/orders/${orderNumber}/pay`
  const cartUrl = `${FRONTEND_URL}/cart`
  
  return sendEmail({
    to: email,
    subject: `Payment Failed - Order #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <span style="font-size: 48px;">❌</span>
        </div>
        <h1 style="color: #dc2626; text-align: center;">Payment Failed</h1>
        <p>Hi ${name},</p>
        <p>Unfortunately, your payment for order <strong>#${orderNumber}</strong> was not successful.</p>
        
        <div style="background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
        </div>

        <p>This could happen for several reasons:</p>
        <ul style="color: #666;">
          <li>Insufficient funds or credit limit reached</li>
          <li>Card details entered incorrectly</li>
          <li>Your bank blocked the transaction</li>
          <li>Card expired or invalid</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${cartUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Try Again
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          If you continue to experience issues, please contact your bank or try a different payment method.
        </p>
      </div>
    `,
    text: `
Hi ${name},

Your payment for order #${orderNumber} was not successful.

Reason: ${reason}

This could happen for several reasons:
- Insufficient funds or credit limit reached
- Card details entered incorrectly
- Your bank blocked the transaction
- Card expired or invalid

Try again: ${cartUrl}

If you continue to experience issues, please contact your bank or try a different payment method.
    `.trim()
  })
}

// Refund confirmation email
export async function sendRefundConfirmationEmail(
  email: string,
  name: string,
  orderNumber: string,
  amount: number
): Promise<boolean> {
  const ordersUrl = `${FRONTEND_URL}/orders`
  
  return sendEmail({
    to: email,
    subject: `Refund Processed - Order #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <span style="font-size: 48px;">💰</span>
        </div>
        <h1 style="color: #16a34a; text-align: center;">Refund Processed</h1>
        <p>Hi ${name},</p>
        <p>Your refund for order <strong>#${orderNumber}</strong> has been processed.</p>
        
        <div style="background: #f0fdf4; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #666;">Refund Amount</p>
          <p style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: #16a34a;">₪${amount.toFixed(2)}</p>
        </div>

        <p style="color: #666;">
          The refund will be credited back to your original payment method. 
          Please allow 5-10 business days for the funds to appear in your account.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${ordersUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View Orders
          </a>
        </div>

        <p style="color: #666; font-size: 14px;">
          If you have any questions about your refund, please contact our support team.
        </p>
      </div>
    `,
    text: `
Hi ${name},

Your refund for order #${orderNumber} has been processed.

Refund Amount: ₪${amount.toFixed(2)}

The refund will be credited back to your original payment method.
Please allow 5-10 business days for the funds to appear in your account.

View your orders: ${ordersUrl}

If you have any questions about your refund, please contact our support team.
    `.trim()
  })
}

// Group invite email
export async function sendGroupInviteEmail(
  email: string,
  inviterName: string,
  groupName: string,
  inviteToken: string
): Promise<boolean> {
  const inviteUrl = `${FRONTEND_URL}/groups/invite/${inviteToken}`
  
  return sendEmail({
    to: email,
    subject: `${inviterName} invited you to join "${groupName}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <span style="font-size: 48px;">👥</span>
        </div>
        <h1 style="color: #333; text-align: center;">You're Invited!</h1>
        <p style="text-align: center; font-size: 16px;">
          <strong>${inviterName}</strong> has invited you to join the group <strong>"${groupName}"</strong>.
        </p>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 30px 0;">
          <p style="margin: 0; text-align: center; color: #666;">
            Join to share shopping carts and collaborate with the group!
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" 
             style="background-color: #4F46E5; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;
                    font-size: 16px; font-weight: bold;">
            Join Group
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; text-align: center;">
          Or copy and paste this link into your browser:<br>
          <a href="${inviteUrl}" style="color: #4F46E5;">${inviteUrl}</a>
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          This invite will expire in 7 days.<br>
          If you don't know ${inviterName}, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `
You're Invited!

${inviterName} has invited you to join the group "${groupName}".

Join to share shopping carts and collaborate with the group!

Click here to join: ${inviteUrl}

This invite will expire in 7 days.
If you don't know ${inviterName}, you can safely ignore this email.
    `.trim()
  })
}

// Group digest email
export interface DigestActivity {
  type: string
  userName: string
  details: string
  timestamp: string
}

export async function sendGroupDigestEmail(
  email: string,
  memberName: string,
  groupName: string,
  groupId: string,
  activities: DigestActivity[],
  period: 'daily' | 'weekly'
): Promise<boolean> {
  const groupUrl = `${FRONTEND_URL}/groups/${groupId}`
  const periodLabel = period === 'daily' ? 'Daily' : 'Weekly'
  
  const activityHtml = activities.length > 0 
    ? activities.map(a => {
        const icon = getActivityIcon(a.type)
        const time = new Date(a.timestamp).toLocaleDateString()
        return `
          <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 8px;">
            <span style="font-size: 18px;">${icon}</span>
            <strong>${a.userName}</strong>: ${a.details}
            <span style="color: #999; font-size: 12px; float: right;">${time}</span>
          </div>
        `
      }).join('')
    : '<p style="color: #666; text-align: center;">No activity this period.</p>'
  
  return sendEmail({
    to: email,
    subject: `${periodLabel} update: ${groupName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <span style="font-size: 36px;">📊</span>
        </div>
        <h1 style="color: #333; text-align: center; margin-bottom: 5px;">
          ${periodLabel} Digest
        </h1>
        <h2 style="color: #666; text-align: center; font-weight: normal; margin-top: 0;">
          ${groupName}
        </h2>
        
        <p>Hi ${memberName},</p>
        <p>Here's what happened in your group this ${period === 'daily' ? 'day' : 'week'}:</p>
        
        <div style="margin: 20px 0;">
          ${activityHtml}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${groupUrl}" 
             style="background-color: #4F46E5; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            View Group
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          You can update your digest preferences in group settings.<br>
          <a href="${groupUrl}/settings" style="color: #4F46E5;">Manage preferences</a>
        </p>
      </div>
    `,
    text: `
${periodLabel} Digest - ${groupName}

Hi ${memberName},

Here's what happened in your group this ${period === 'daily' ? 'day' : 'week'}:

${activities.length > 0 
  ? activities.map(a => `• ${a.userName}: ${a.details}`).join('\n')
  : 'No activity this period.'}

View group: ${groupUrl}
    `.trim()
  })
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'member_joined': return '👋'
    case 'member_left': return '👋'
    case 'item_added': return '🛒'
    case 'item_removed': return '🗑️'
    case 'invite_sent': return '📧'
    case 'group_updated': return '⚙️'
    default: return '📌'
  }
}

// Group expiration warning email
export async function sendGroupExpirationWarningEmail(
  email: string,
  memberName: string,
  groupName: string,
  groupId: string,
  expiresAt: Date,
  isOwner: boolean
): Promise<boolean> {
  const groupUrl = `${FRONTEND_URL}/groups/${groupId}`
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  
  return sendEmail({
    to: email,
    subject: `⚠️ Group "${groupName}" expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <span style="font-size: 48px;">⏰</span>
        </div>
        <h1 style="color: #f59e0b; text-align: center;">Group Expiring Soon</h1>
        <p style="text-align: center; font-size: 16px;">
          The group <strong>"${groupName}"</strong> will expire in <strong>${daysLeft} day${daysLeft !== 1 ? 's' : ''}</strong>.
        </p>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 30px 0;">
          <p style="margin: 0; text-align: center; color: #92400e;">
            ${isOwner 
              ? 'As the owner, you can extend the group to keep it active.'
              : 'Contact the group owner to extend the group.'}
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${groupUrl}" 
             style="background-color: #4F46E5; color: white; padding: 14px 32px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;
                    font-size: 16px; font-weight: bold;">
            ${isOwner ? 'Extend Group' : 'View Group'}
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          Once expired, the group and its shared cart will be archived.
        </p>
      </div>
    `,
    text: `
Group Expiring Soon

The group "${groupName}" will expire in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.

${isOwner 
  ? 'As the owner, you can extend the group to keep it active.'
  : 'Contact the group owner to extend the group.'}

View group: ${groupUrl}

Once expired, the group and its shared cart will be archived.
    `.trim()
  })
}
