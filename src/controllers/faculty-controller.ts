import { getFaculty, createFaculty } from "../services/ddl-master-service";
import { success, error } from "../utils/response";
import type { ApiResponse } from "../types/response";

export const getFacultyController = async (): Promise<ApiResponse<any[]>> => {
  const items = await getFaculty();
  return success(items);
};

export const createFacultyController = async ({
  body,
}: {
  body: { name: string };
}) => {
  try {
    const { name } = body;
    console.log(name);

    if (!name) {
      return error("กรุณาระบุชื่อคณะ (name)", 400);
    }

    await createFaculty(name);
    return success(null, "บันทึกสำเร็จ");
  } catch (err: any) {
    return error(err.message || "ไม่สามารถบันทึกข้อมูลได้", 500);
  }
};
