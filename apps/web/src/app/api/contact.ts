import axios from "axios";
import { BASE_URL } from "./config";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export const submitContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
  try {
    const response = await axios.post<ContactResponse>(
      `${BASE_URL}/api/v1/contact`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      throw new Error(error.response.data.message || "Failed to send message");
    }
    throw new Error("Failed to send message. Please try again.");
  }
};

