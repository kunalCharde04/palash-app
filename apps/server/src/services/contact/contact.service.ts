import { transporter } from "../../config/mail.config.js";

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    category: string;
}

export async function sendContactEmail(formData: ContactFormData) {
    const { name, email, phone, subject, message, category } = formData;

    // Format category for display
    const categoryLabels: Record<string, string> = {
        general: 'General Inquiry',
        membership: 'Membership',
        booking: 'Booking Support',
        technical: 'Technical Issue',
        billing: 'Billing & Payments',
        feedback: 'Feedback',
        complaint: 'Complaint'
    };

    const categoryLabel = categoryLabels[category] || category;

    // Email to admin (The Palash Club)
    const adminEmailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
            <div style="text-align: center; padding: 20px; background: #012b2b; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0;">New Contact Form Submission</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #333;">You have received a new message from your website contact form.</p>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <h3 style="color: #012b2b; margin-top: 0;">Contact Information</h3>
                    <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #517d64;">${email}</a></p>
                    <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
                    <p style="margin: 8px 0;"><strong>Category:</strong> <span style="background: #517d64; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px;">${categoryLabel}</span></p>
                </div>

                <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <h3 style="color: #012b2b; margin-top: 0;">Subject</h3>
                    <p style="margin: 5px 0; font-size: 16px;">${subject}</p>
                </div>

                <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <h3 style="color: #012b2b; margin-top: 0;">Message</h3>
                    <p style="margin: 5px 0; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                </div>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 12px; color: #666;">
                    <p style="margin: 5px 0;"><strong>Submitted on:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    <p style="margin: 5px 0;"><strong>IP Address:</strong> System Generated</p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="mailto:${email}" style="display: inline-block; background: #012b2b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reply to ${name}</a>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} The Palash Club. All rights reserved.</p>
            </div>
        </div>
    `;

    // Confirmation email to user
    const userEmailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #ffffff;">
            <div style="text-align: center; padding: 20px; background: #517d64; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0;">Thank You for Contacting Us</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #333;">Dear ${name},</p>
                
                <p style="font-size: 16px; color: #333;">Thank you for reaching out to The Palash Club. We have received your message and will respond within 24 hours on business days.</p>
                
                <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <h3 style="color: #517d64; margin-top: 0;">Your Message Details</h3>
                    <p style="margin: 8px 0;"><strong>Category:</strong> ${categoryLabel}</p>
                    <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
                    <p style="margin: 8px 0; color: #666; font-size: 14px;">Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>

                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        <strong>Note:</strong> If your inquiry is urgent, please call us directly at <a href="tel:+919422115180" style="color: #012b2b;">+91 9422115180</a>
                    </p>
                </div>

                <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                    <h3 style="color: #517d64; margin-top: 0;">Contact Information</h3>
                    <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:+919422115180" style="color: #012b2b;">+91 9422115180</a></p>
                    <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:thepalashclub@gmail.com" style="color: #012b2b;">thepalashclub@gmail.com</a></p>
                    <p style="margin: 8px 0;"><strong>Address:</strong> Khasra No. 107, Village Sawangi (Amgaon Deoli), Taluka Hingna, District Nagpur</p>
                </div>

                <p style="font-size: 14px; color: #666; font-style: italic; text-align: center; margin-top: 30px;">
                    "Come in the side of Ayurveda, come close to healthy life." - Dr. Komal Kashikar
                </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} The Palash Club. All rights reserved.</p>
                <p style="margin-top: 10px;">
                    <a href="https://www.palash.club.com" style="color: #517d64; text-decoration: none; margin: 0 10px;">Website</a> |
                    <a href="https://www.palash.club.com/faq" style="color: #517d64; text-decoration: none; margin: 0 10px;">FAQ</a> |
                    <a href="https://www.palash.club.com/about" style="color: #517d64; text-decoration: none; margin: 0 10px;">About Us</a>
                </p>
            </div>
        </div>
    `;

    try {
        // Send email to admin
        await transporter.sendMail({
            from: `"Palash Website Contact Form" <priyanshu.kun555@gmail.com>`,
            to: "thepalashclub@gmail.com",
            replyTo: email,
            subject: `[${categoryLabel}] ${subject}`,
            html: adminEmailTemplate,
        });

        // Send confirmation email to user
        await transporter.sendMail({
            from: `"The Palash Club" <priyanshu.kun555@gmail.com>`,
            to: email,
            subject: "Thank you for contacting The Palash Club",
            html: userEmailTemplate,
        });

        console.log(`Contact form email sent successfully to admin and confirmation sent to ${email}`);
    } catch (error) {
        console.error("Error sending contact form emails:", error);
        throw error;
    }
}

