import { success, error } from "@/utils/response";
import {
  getGraduatesByFacultyPaginated,
  getGroupedQuotaByRound,
  insertQuotaData,
  getQuotaSummaryByRound,
  getRemainingNotReceivedByEarliestRound,
  getFirstGraduateNotReceivedInEarliestRound,
  getRoundCallSummary,
  getNextGraduatesAfterFirst,
  setGraduateAsReceived,
  resetReceivedCards,
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

export const saveQuotaGroupsController = async ({
  body,
}: {
  body: any;
}): Promise<ApiResponse<any>> => {
  try {
    if (!Array.isArray(body)) return error("Invalid payload format");

    await insertQuotaData(body);
    return success({ message: "บันทึกข้อมูลเรียบร้อยแล้ว" });
  } catch (err) {
    console.error("❌ insertQuotaData error:", err);
    return error("ไม่สามารถบันทึกข้อมูลได้");
  }
};

export const showQuotaData = async (): Promise<ApiResponse<any>> => {
  try {
    const quotaData = await getQuotaSummaryByRound();
    return success(quotaData);
  } catch (err) {
    console.error("❌ getQuotaSummaryByRound error:", err);
    return error("ไม่สามารถดึงข้อมูล quota summary ได้");
  }
};

export const RemainingNotReceivedByEarliestRound = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const quotaData = await getRemainingNotReceivedByEarliestRound();
    return success(quotaData);
  } catch (err) {
    console.error("❌ RemainingNotReceivedByEarliestRound error:", err);
    return error("ไม่สามารถดึงข้อมูล RemainingNotReceivedByEarliestRound ได้");
  }
};

export const getFirstGraduateNotReceivedController = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const result = await getFirstGraduateNotReceivedInEarliestRound();
    return success(result);
  } catch (err) {
    console.error("❌ getFirstGraduateNotReceivedController error:", err);
    return error("ไม่สามารถดึงข้อมูลบัณฑิตคนแรกในรอบที่ยังไม่ได้รับบัตรได้");
  }
};

export const getRoundCallSummaryController = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const result = await getRoundCallSummary();
    return success(result);
  } catch (err) {
    console.error("❌ getRoundCallSummaryController error:", err);
    return error("ไม่สามารถดึงข้อมูลสรุปรอบเรียกบัณฑิตได้");
  }
};

export const getNextGraduatesAfterFirstController = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const result = await getNextGraduatesAfterFirst();
    return success(result);
  } catch (err) {
    console.error("❌ getNextGraduatesAfterFirstController error:", err);
    return error("ไม่สามารถดึงข้อมูลบัณฑิตถัดไปได้");
  }
};

export const setGraduateAsReceivedController = async ({
  body,
}: {
  body: { id: any };
}): Promise<ApiResponse<{ success: boolean }>> => {
  try {
    const { id } = body;
    if (!id || isNaN(id)) return error("กรุณาระบุรหัสบัณฑิต (id)");

    const result = await setGraduateAsReceived(id);
    return success(result, "อัปเดตสถานะบัณฑิตเรียบร้อยแล้ว");
  } catch (err) {
    console.error("❌ setGraduateAsReceivedController error:", err);
    return error("ไม่สามารถอัปเดตสถานะบัณฑิตได้");
  }
};

export const resetReceivedCardsController = async () => {
  const result = await resetReceivedCards();
  if (!result.success) return error("ไม่มีข้อมูลที่ถูกรีเซ็ต");

  return success(null, "รีเซ็ตข้อมูลการรับบัตรเรียบร้อยแล้ว");
};
