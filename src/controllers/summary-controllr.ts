import { success, error } from "../utils/response";
import {
  getGraduateSummary,
  getNextGraduatesAfterFirst,
  getRoundCallSummary,
  getFirstGraduateNotReceivedInEarliestRound,
} from "../services/graduate-service";
import { ApiResponse } from "@/types/response";

export const getGraduateOverviewController = async (): Promise<
  ApiResponse<any>
> => {
  try {
    const [graduateSummary, nextGraduates, roundSummary, firstGraduate] =
      await Promise.all([
        getGraduateSummary(),
        getNextGraduatesAfterFirst(),
        getRoundCallSummary(),
        getFirstGraduateNotReceivedInEarliestRound(),
      ]);

    return success({
      graduate_summary: graduateSummary,
      next_graduates: nextGraduates,
      round_summary: roundSummary,
      first_graduate: firstGraduate,
    });
  } catch (err) {
    console.error("❌ getGraduateOverviewController error:", err);
    return error("ไม่สามารถดึงข้อมูลสรุปภาพรวมทั้งหมดได้");
  }
};
