## Overview

This module provides a higher-order function (HOF) that wraps Express route
handlers to standardize error handling, logging, and response formatting. It
also offers flexibility by allowing users to pass custom error handling
functions, enabling them to stop execution before the `finally` block if
necessary.

### File Structure

- **@constants/statusCodes**: Enum or object that contains HTTP status codes.
- **@utils/handleError**: Utility function for processing errors and extracting
  a meaningful message.
- **@utils/responseObject**: Utility function to format and send HTTP responses.
- **netwrap/logger**: Logger utility for logging errors and performance metrics.

### Functionality

The exported function is designed to be used as a wrapper around your Express
route handlers. It accepts an `operation` function, which represents the core
logic of your route handler, and an optional `errorHandler` function, providing
enhanced control over error handling.

#### Parameters

1.  **operation**:

    - A function that contains the main logic of your route handler. It receives
      the Express `request`, `response`, and `next` objects as well as a
      `context` object. The `context` is used to manage the response status,
      message, and payload.

2.  **errorHandler** (optional):

    - A custom function that handles errors. It is invoked when an error occurs
      during the `operation`.
    - The `errorHandler` receives the `error`, `context`, and the Express
      parameters (`request`, `response`, `next`).
    - If `errorHandler` returns `true`, the execution stops before the `finally`
      block.

### Workflow

1.  **Context Initialization**:

    - The `context` object is initialized with default values for `statusCode`,
      `message`, and `payload`.

2.  **Operation Execution**:

    - The `operation` function is invoked with `rest` (Express request and
      response objects) and `context`. It is expected to perform the necessary
      operations and update the `context` as needed.

3.  **Error Handling**:

    - If an error occurs, it is logged.
    - The `errorHandler` (if provided) is invoked. If it returns `true`, the
      execution stops, preventing the `finally` block from executing.
    - If the execution is not stopped, the `handleError` function processes the
      error message.

4.  **Performance Logging**:

    - The execution time of the operation is measured and logged to help with
      performance monitoring.

5.  **Response Handling**:

    - The response is sent back to the client using the `responseObject`
      function, which includes the status code, message, and payload from the
      `context`.

### Usage Example

```typescript
import { Router } from "express";
import wrapHandler from "./path/to/this/module";

const router = Router();

const customErrorHandler = (error, context, [req, res, next]) => {
  // Custom logic to determine if execution should stop
  if (someCondition) {
    context.message = "Custom Error Message";
    res.status(400).send({ message: context.message });
    return true; // Stop execution
  }
  return false; // Continue execution
};

router.get(
  "/example",
  wrapHandler(
    async (req, res, next, context) => {
      // Your handler logic here
      context.statusCode = 200;
      context.message = "Success";
      context.payload = { data: "Example data" };
    },
    customErrorHandler, // Pass the custom error handler
  ),
);

export default router;
```

### Key Points

- **Custom Error Handling**: Users can define custom error handling logic that
  determines whether the execution should proceed or stop based on specific
  conditions.
- **Optional Parameter**: The `errorHandler` is optional, allowing for
  flexibility in how errors are managed.
- **Context Management**: The `context` object allows for dynamic control over
  the response status, message, and payload.
- **Performance Monitoring**: Logs the time taken to execute the handler, aiding
  in performance analysis.
- **Reusability**: This pattern can be applied to any route handler, promoting
  code reusability and maintainability.

---
