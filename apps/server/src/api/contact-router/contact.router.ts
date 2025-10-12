import { Router } from "express";
import { submitContactForm } from "../../controllers/contact/contact.controller.js";

const router = Router();

// POST /api/contact - Submit contact form
router.post("/", submitContactForm);

export default router;

