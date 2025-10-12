import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendContactEmail } from "../../services/contact/contact.service.js";

export const submitContactForm = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phone, subject, message, category } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields (name, email, subject, message, category)"
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address"
        });
    }

    try {
        await sendContactEmail({
            name,
            email,
            phone: phone || 'Not provided',
            subject,
            message,
            category
        });

        return res.status(200).json({
            success: true,
            message: "Your message has been sent successfully. We'll get back to you soon!"
        });
    } catch (error) {
        console.error("Error sending contact email:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to send your message. Please try again or contact us directly."
        });
    }
});

