import { success, error } from "@/utils/response";
import {
  getGraduatesByFacultyPaginated,
  getGroupedQuotaByRound,
} from "@/services/graduate-service";
import type { ApiResponse } from "@/types/response";

export const getGraduatesController = async ({
  body,
}: {
  body: { facultyId?: number; page?: number; pageSize?: number };
}): Promise<ApiResponse<any>> => {
  const facultyId = body.facultyId ?? 0;
  const page = body.page ?? 1;
  const pageSize = body.pageSize ?? 10;

  if (!facultyId || isNaN(facultyId)) return error("Invalid facultyId");
  if (isNaN(page) || page < 1) return error("Invalid page number");
  if (isNaN(pageSize) || pageSize < 1) return error("Invalid page size");

  const result = await getGraduatesByFacultyPaginated(
    facultyId,
    page,
    pageSize
  );

  return success(result);
};

export const getQuotaGroupsController = async (): Promise<ApiResponse<any>> => {
  try {
    const data = await getGroupedQuotaByRound();
    return success(data);
  } catch (err) {
    return error("ไม่สามารถโหลดข้อมูลได้");
  }
};
