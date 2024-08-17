import { logger } from "netwrap";
import i18ns from "../constants/i18ns";

export default <T = unknown>(error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const err = error as { message: string };
    return err.message;
  }

  const castedError = error as T;

  logger(castedError);

  return i18ns.LOGS.GENERAL.CRITICAL_ERROR;
};
