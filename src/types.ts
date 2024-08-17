import { HttpStatusCode } from "./constants";
import type { RequestHandler, Response } from "express";

export type ResponseObjectFn = (props: {
  res: Response;
  statusCode: number;
  message: string;
  payload?: unknown;
  responseStatusCode?: string | number;
  status?: boolean;
}) => void;

export type HandlerContext = {
  statusCode: HttpStatusCode;
  message: string;
  payload: unknown;
  responseSent: boolean;
};

export type ErrorHandler = (
  error: unknown,
  context: HandlerContext,
  rest: Parameters<RequestHandler>,
) => void;

export type WrapperConfig = {
  logging?: boolean;
  errorHandler?: ErrorHandler;
};
