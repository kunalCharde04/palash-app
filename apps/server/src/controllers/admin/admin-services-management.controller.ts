import { Request, Response, NextFunction } from "express"
import fs from "fs";
import path from "path";
import { NotificationType, prisma } from "@palash/db-client";
import { RequestBody_Create, RequestBody_Update } from "../../@types/interfaces.js";
import { __dirname } from "../../utils/__dirname-handler.js";
import winston from "winston";
import { deleteServicesRedisKeys } from "../../utils/delete-all-redis-keys.js";
import NotificationService from "../../services/notification/notification.service.js";
import { Prisma } from '@prisma/client';



class AdminServiceManagementController {
  static async createService(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const {
        name,
        description = [],
        shortDescription,
        price,
        category,
        featured,
        currency,
        tags = [],
        duration,
        instructorName,
        instructorBio,
        cancellationPolicy,
        isActive = true,
        isOnline = false,
        location,
        virtualMeetingDetails
      }: RequestBody_Create = req.body;

      if (!name || !description || description.length === 0 || !price || !category || !duration) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }



      const media = req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${name}/${file.filename}`) : [];

      await deleteServicesRedisKeys();

      const service = await prisma.service.create({
        data: {
          name,
          description: typeof description === 'string' ? JSON.parse(description) : description,
          shortDescription,
          media,
          category,
          tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
          currency,
          price: parseFloat(price).toFixed(4),
          duration: Number(duration),
          instructorName,
          instructorBio,
          cancellationPolicy,
          featured: (featured as unknown as string) === 'true',
          isActive: (isActive as unknown as string) === 'true',
          isOnline: (isOnline as unknown as string) === 'true',
          location: typeof location === 'string' ? (() => {
            try {
              return JSON.parse(location);
            } catch (e) {
              console.log('Invalid location JSON:', location);
              return null;
            }
          })() : location,
          virtualMeetingDetails: typeof virtualMeetingDetails === 'string' ? (() => {
            try {
              return JSON.parse(virtualMeetingDetails);
            } catch (e) {
              console.log('Invalid virtualMeetingDetails JSON:', virtualMeetingDetails);
              return null;
            }
          })() : virtualMeetingDetails,
        },
      });

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 3);

      const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
      const timeSlots = [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
        { startTime: '13:00', endTime: '14:00' }, // After lunch break
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '15:00', endTime: '16:00' }
      ];

      for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
        if (workingDays.includes(dt.getDay())) {
          // Create availability for the day
          const availability = await prisma.availability.create({
            data: {
              service_id: service.id,
              date: new Date(dt),
              is_bookable: true,
            },
          });

          // Create time slots for this day
          await Promise.all(timeSlots.map(async slot => {
            const [startHour, startMinute] = slot.startTime.split(':');
            const [endHour, endMinute] = slot.endTime.split(':');
            
            const startTime = new Date(dt);
            startTime.setHours(parseInt(startHour) + 5, parseInt(startMinute) + 30, 0);
            
            const endTime = new Date(dt);
            endTime.setHours(parseInt(endHour) + 5, parseInt(endMinute) + 30, 0);

            return prisma.timeSlot.create({
              data: {
                availability_id: availability.id,
                start_time: startTime,
                end_time: endTime,
                status: 'AVAILABLE'
              }
            });
          }));
        }
      }

      await NotificationService.getInstance().createNotification({
        userId: req.user?.userId,
        type: NotificationType.SERVICE_CREATED,
        title: "Service Created",
        message: "A new service has been created",
        data: { serviceId: service.id }
      });

      res.status(201).json({
        message: "Service created successfully",
        service
      });
    } catch (err) {
      next(err);
    }
  }
  static async updateServiceImages(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { serviceId } = req.params;
      const { deleteImages } = req.body;
      const uploadedImages = req.files as Express.Multer.File[];


      if (!serviceId) {
        res.status(400).json({ error: "Service ID is required" });
      }

      const service = await prisma.service.findUnique({ where: { id: serviceId } });

      if (!service) {
        throw new Error('Service not found');
      }

      const serviceFolder = path.join(__dirname, "../uploads", service.name);
      let updatedMedia = service.media;

      const parsedDeletedImages = JSON.parse(deleteImages);

      if (parsedDeletedImages && Array.isArray(parsedDeletedImages)) {
        for (const img of parsedDeletedImages) {
          const imgPath = path.join(serviceFolder, img);
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        }
        updatedMedia = updatedMedia.filter((img: any) => {
          const splitedData = img.split('/');
          const imgName = splitedData[splitedData.length-1];
          return !parsedDeletedImages.includes(imgName);
        });

      }

      const newImages = uploadedImages.map(file => `/uploads/${service.name}/${file.filename}`);
      updatedMedia = [...updatedMedia, ...newImages].slice(0, 10);

      await prisma.service.update({
        where: { id: serviceId },
        data: { media: updatedMedia },
      });

      await NotificationService.getInstance().createNotification({
        userId: req.user?.userId,
        type: NotificationType.SERVICE_UPDATED,
        title: "Service Updated",
        message: "The service has been updated",
        data: { serviceId: serviceId }
      });

      await deleteServicesRedisKeys();

      res.status(200).json({ message: "Images updated successfully", media: updatedMedia });
    } catch (err) {
      console.error("Error updating service images:", err);
      next(err);
    }
  }

  static async updateServiceData(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { serviceId } = req.params;
      const {
        name,
        description,
        shortDescription,
        price,
        category,
        featured,
        tags,
        duration,
        instructorName,
        instructorBio,
        cancellationPolicy,
        isActive,
        isOnline,
        location,
        virtualMeetingDetails
      }: RequestBody_Update = req.body;

      if (!serviceId) {
        res.status(400).json({ error: "Service ID is required" });
        return;
      }

      const service = await prisma.service.findUnique({ where: { id: serviceId } });

      if (!service) {
        res.status(404).json({ error: "Service not found" });
        return;
      }

      let serviceFolder = path.join(__dirname, "../uploads", service.name);

      if (name && name !== service.name) {
        const newFolderPath = path.join(__dirname, "../uploads", name);
        if (fs.existsSync(serviceFolder)) {
          fs.renameSync(serviceFolder, newFolderPath);
        }
        serviceFolder = newFolderPath;
      }

      const updatedService = await prisma.service.update({
        where: { id: serviceId },
        data: {
          name,
          description,
          shortDescription,
          category,
          tags: typeof tags === 'string' ? JSON.parse(tags) : tags,
          price: price ? parseFloat(price).toFixed(4) : undefined,
          duration: Number(duration),
          instructorName,
          instructorBio,
          cancellationPolicy,
          featured: Boolean(featured),
          isActive: Boolean(isActive),
          isOnline: Boolean(isOnline),
          location: typeof location === 'string' ? (() => {
            try {
              return JSON.parse(location);
            } catch (e) {
              console.log('Invalid location JSON:', location);
              return null;
            }
          })() : location,
          virtualMeetingDetails: typeof virtualMeetingDetails === 'string' ? (() => {
            try {
              return JSON.parse(virtualMeetingDetails);
            } catch (e) {
              console.log('Invalid virtualMeetingDetails JSON:', virtualMeetingDetails);
              return null;
            }
          })() : virtualMeetingDetails
        },
      });

      await NotificationService.getInstance().createNotification({
        userId: req.user?.userId,
        type: NotificationType.SERVICE_UPDATED,
        title: "Service Updated",
        message: "The service has been updated",
        data: { serviceId: serviceId }
      });

      await deleteServicesRedisKeys();

      res.status(200).json({ message: "Service updated successfully", service: updatedService });
    } catch (err) {
      console.error("Error updating service data:", err);
      next(err);
    }
  }
  static async deleteService(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { serviceId }: { serviceId: string } = req.body;

      if (!serviceId) {
        res.status(400).json({ error: "Service ID is required" });
        return;
      }

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        res.status(404).json({ error: "Service not found" });
        return;
      }

      // Delete in correct order respecting foreign key constraints
      try {
        // First delete all time slots
        await prisma.timeSlot.deleteMany({
          where: {
            availability: {
              service_id: serviceId
            }
          }
        });

        await prisma.booking.deleteMany({
          where: {
            service_id: serviceId
          }
        })

        await prisma.payment.deleteMany({
          where: {
            service_id: serviceId
          }
        })

        // Then delete availabilities
        await prisma.availability.deleteMany({
          where: { service_id: serviceId }
        });

        // Delete reviews
        await prisma.review.deleteMany({
          where: { service_id: serviceId }
        });

        // Finally delete the service
        await prisma.service.delete({
          where: { id: serviceId }
        });

        await deleteServicesRedisKeys();

        res.json({ message: "Service and related data deleted successfully" });
      } catch (error) {
        console.error("Error in cascade deletion:", error);
        throw error;
      }
    } catch (err) {
      console.error("Error deleting service:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }
  }
}


export default AdminServiceManagementController;