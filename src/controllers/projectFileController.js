import { ProjectFileService } from "../services/projectFileService";
import { ApiResponse } from "../utils/apiResponse";

export class ProjectFileController {
  static async list(req, projectId) {
    return ApiResponse.success("Files retrieved", await ProjectFileService.getFilesByProject(projectId), 200);
  }
  static async upload(req, projectId) {
    const formData = await req.formData();
    const file = await ProjectFileService.uploadFile(projectId, formData, req.user?.id);
    return ApiResponse.success("File uploaded", file, 201);
  }
  static async delete(req, projectId, fileId) {
    await ProjectFileService.deleteFile(fileId, req.user?.id);
    return ApiResponse.success("File deleted", null, 200);
  }
}
