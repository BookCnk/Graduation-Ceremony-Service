import {
  getFaculty,
  createFaculty,
  deleteFaculty,
} from "../services/ddl-master-service";

import { createGraduate } from "../services/ddl-master-service";
import { success, error } from "../utils/response";
import type { ApiResponse } from "../types/response";

export const getFacultyController = async (): Promise<ApiResponse<any[]>> => {
  const items = await getFaculty();
  return success(items);
};

export const createFacultyController = async ({
  body,
}: {
  body: { id: number; name: string };
}) => {
  try {
    const { id, name } = body;
    console.log("id:", id, "name:", name);

    if (!id || !name) {
      return error("กรุณาระบุรหัสคณะ (id) และชื่อคณะ (name)", 400);
    }

    if (isNaN(id)) {
      return error("รหัสคณะ (id) ต้องเป็นตัวเลข", 400);
    }

    await createFaculty(id, name);
    return success(null, "บันทึกสำเร็จ");
  } catch (err: any) {
    return error(err.message || "ไม่สามารถบันทึกข้อมูลได้", 500);
  }
};

export const deleteFacultyController = async ({
  params,
}: {
  params: { id: string };
}): Promise<ApiResponse<null>> => {
  try {
    const id = Number(params.id);

    if (isNaN(id)) {
      return error("รหัสคณะ (id) ต้องเป็นตัวเลข", 400);
    }

    await deleteFaculty(id);
    return success(null, "ลบข้อมูลสำเร็จ");
  } catch (err: any) {
    return error(err.message || "ไม่สามารถลบข้อมูลได้", 500);
  }
};

export const createGraduateController = async ({
  body,
}: {
  body: {
    id: number;
    prefix: string;
    first_name: string;
    last_name: string;
    degree_level: string;
    degree_name: string;
    faculty_id: number;
    sequence: number;
    round_id: number;
    has_received_card?: number;
    graduate_type?: string | null;
  }[];
}) => {
  try {
    for (const graduate of body) {
      const {
        id,
        prefix,
        first_name,
        last_name,
        degree_level,
        degree_name,
        faculty_id,
        sequence,
        round_id,
        has_received_card = 0,
        graduate_type = null,
      } = graduate;

      if (
        id == null ||
        first_name?.trim() === "" ||
        degree_level?.trim() === "" ||
        degree_name?.trim() === "" ||
        faculty_id == null
      ) {
        return error(`ข้อมูลไม่ครบถ้วนสำหรับบัณฑิต id: ${id}`, 400);
      }

      await createGraduate(
        id,
        prefix,
        first_name,
        last_name,
        degree_level,
        degree_name,
        faculty_id,
        sequence,
        round_id,
        has_received_card,
        graduate_type
      );
    }

    return success(null, "เพิ่มข้อมูลบัณฑิตทั้งหมดสำเร็จ");
  } catch (err: any) {
    console.error("❌ Insert error:", err);
    throw err;
  }
};
