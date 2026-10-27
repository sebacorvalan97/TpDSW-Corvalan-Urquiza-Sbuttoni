import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminRouter = Router();

// Pública
adminRouter.post("/login", adminController.login);

// Solo administradores autenticados
adminRouter.post("/logout", requireAdmin, adminController.logout);
adminRouter.get("/me", requireAdmin, adminController.getCurrentAdmin);
adminRouter.get("/", requireAdmin, adminController.getAllAdmins);
adminRouter.post("/", requireAdmin, adminController.createAdmin);
adminRouter.get("/:id", requireAdmin, adminController.getAdminById);
adminRouter.put("/:id", requireAdmin, adminController.updateAdmin);
adminRouter.delete("/:id", requireAdmin, adminController.deleteAdmin);
