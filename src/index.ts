import { HttpStatusCode } from "./constants";
import { HandlerContext, WrapperConfig } from "./types";
import { handleError, responseObject } from "./utils";
import { RequestHandler } from "express";
import { logger } from "netwrap";

export default (
    operation: (
      rest: Parameters<RequestHandler>,
      context: HandlerContext,
    ) => Promise<void> | void,
    config?: WrapperConfig,
  ) =>
  async (...rest: Parameters<RequestHandler>) => {
    const res = rest[1];

    const context: HandlerContext = {
      statusCode: HttpStatusCode.InternalServerError,
      message: "A critical error has occurred",
      payload: null,
      responseSent: false,
    };

    const startTime = performance.now();

    try {
      await operation(rest, context);

      if (res.headersSent) {
        context.responseSent = true;
        return;
      }
    } catch (error) {
      if (config?.errorHandler) {
        config.errorHandler(error, context, rest);

        if (res.headersSent) {
          context.responseSent = true;
          return;
        }
      }

      context.message = handleError<{
        message: string;
      }>(error);
    } finally {
      if (!context.responseSent) {
        const endTime = performance.now();
        const elapsedTime = endTime - startTime;
        if (config?.logging !== false) {
          logger({ elapsedTime });
        }
        responseObject({
          res,
          message: context.message,
          statusCode: context.statusCode,
          payload: context.payload,
        });
      }
    }
  };
