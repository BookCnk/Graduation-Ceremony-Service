import { getFaculty } from "../services/ddl-master-service";
import { success } from "../utils/response";
import type { ApiResponse } from "../types/response";

export const getFacultyController = async (): Promise<ApiResponse<any[]>> => {
  const items = await getFaculty();
  return success(items);
};
