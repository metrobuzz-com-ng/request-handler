import { HttpStatusCode } from "@constants";
import { HandlerContext } from "@types";
import { handleError, responseObject } from "@utils";
import { RequestHandler } from "express";
import { logger } from "netwrap";

export default (
    operation: (
      rest: Parameters<RequestHandler>,
      context: HandlerContext,
    ) => Promise<void> | void,
  ) =>
  async (...rest: Parameters<RequestHandler>) => {
    const res = rest[1];

    const context: HandlerContext = {
      statusCode: HttpStatusCode.InternalServerError,
      message: "A critical error has occurred",
      payload: null,
    };

    const startTime = performance.now();

    try {
      await operation(rest, context);
    } catch (error) {
      logger(error);
      context.message = handleError<{
        message: string;
      }>(error);
    } finally {
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;
      logger({ elapsedTime });
      responseObject({
        res,
        message: context.message,
        statusCode: context.statusCode,
        payload: context.payload,
      });
    }
  };
