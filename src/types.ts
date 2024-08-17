import { HttpStatusCode } from "@constants";
import type { Response } from "express";

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
};
