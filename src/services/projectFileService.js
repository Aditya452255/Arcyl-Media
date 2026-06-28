import { ProjectFileRepository } from "../repositories/projectFileRepository";
import { ProjectRepository } from "../repositories/projectRepository";
import { MediaService } from "./mediaService";
import { AuditService } from "./auditService";
import { NotFoundError, ValidationError } from "../utils/errors";

export class ProjectFileService {
  static async uploadFile(projectId, formData, userId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");

    const file = formData.get("file");
    const fileCategory = formData.get("fileCategory") || "OTHER";
    const version = parseInt(formData.get("version") || "1", 10);

    if (!file || !(file instanceof File)) throw new ValidationError("No valid file attached");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const mediaAsset = await MediaService.uploadFile(
      buffer, file.name, file.type, file.size,
      `arcyl_media/projects/${projectId}`, userId, file.name
    );

    const projectFile = await ProjectFileRepository.create({
      projectId,
      mediaAssetId: mediaAsset.id,
      fileCategory,
      version,
      uploadedById: userId,
    });

    await AuditService.log("PROJECT_FILE_UPLOAD", { projectId, fileId: projectFile.id }, userId, null, projectFile, "ProjectFile");
    return projectFile;
  }

  static async getFilesByProject(projectId) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) throw new NotFoundError("Project not found");
    return ProjectFileRepository.findByProjectId(projectId);
  }

  static async deleteFile(id, userId) {
    const existing = await ProjectFileRepository.findById(id);
    if (!existing) throw new NotFoundError("Project file not found");
    await ProjectFileRepository.softDelete(id);
    await AuditService.log("PROJECT_FILE_DELETE", { fileId: id }, userId, existing, null, "ProjectFile");
  }
}
