### Express Route Handler Wrapper

#### Overview

This Express route handler wrapper enhances request handling by providing robust
error management, logging control, and response management. It ensures that
responses are sent only once, whether from within the main operation or from
custom error handling logic. The wrapper offers flexibility through
configuration options and integrates seamlessly with your Express routes.

#### Features

1.  **Custom Error Handling**: Customize error handling with the option to stop
    further execution and send a response.
2.  **Logging Control**: Toggle logging for errors and performance metrics.
3.  **Single Response Guarantee**: Ensure that a response is only sent once,
    whether from the `operation` function or an `errorHandler`.
4.  **Performance Monitoring**: Track and log the execution time of the handler
    function.

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
    - The `errorHandler` (if provided) is invoked. If you return a response to
      the client, the execution of the wrapper stops.
    - If the execution is not stopped, the `handleError` function processes the
      error message.

4.  **Performance Logging**:

    - The execution time of the operation is measured and logged to help with
      performance monitoring.

5.  **Response Handling**:

    - The response is sent back to the client using the `responseObject`
      function, which includes the status code, message, and payload from the
      `context`.

#### Installation

```bash
npm install @metrobuzz/express-request-handler
```

#### Usage

##### Basic Example

Here's the most basic way to send a response to the client:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    context.statusCode = 200;
    context.message = "Operation was successful";
    context.payload = { data: "Example data" };
    // The wrapper will skip sending another response
  }),
);

export default router;
```

Wrap your route handler to add enhanced error handling and logging:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    context.statusCode = 200;
    context.message = "Operation was successful";
    context.payload = { data: "Example data" };

    // You can still send the response directly if you want
    res.send(context.payload);
  }),
);

export default router;
```

You can also throw errors out of the main asynchronous function and they will be
handled

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";
import { logger } from "netwrap";

const router = Router();

// You can throw an error from the main asynchronous function

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    // Simulate an error
    throw new Error("An unexpected error occurred");
  }),
);

export default router;
```

##### Configuration Options

The wrapper function accepts a configuration object to customize its behavior:

- **`logging`**: A boolean flag to enable or disable logging. Defaults to
  `true`.
- **`errorHandler`**: A function to handle errors. If the `errorHandler` sends a
  response, further execution will be stopped.

`NB: Both options are optional`

Example:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";
import { logger } from "netwrap";

const router = Router();

const customErrorHandler = (error, context, [req, res, next]) => {
  logger({ error, context });
  res.status(500).send("Custom Error Response");
};

router.get(
  "/example",
  wrapHandler(
    async (req, res, next, context) => {
      // Simulate an error
      throw new Error("An unexpected error occurred");
    },
    {
      logging: true, // Enable logging errorHandler:
      customErrorHandler, // Custom error handler
    },
  ),
);

export default router;
```

##### Advanced Scenarios

###### 1\. **Response Sent in Operation Function**

If a response is sent within the `operation` function, the wrapper will detect
it and prevent further response processing:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    context.statusCode = 200;
    context.message = "Operation was successful";
    context.payload = { data: "Example data" };

    // Send the response directly
    res.send(context.payload);

    // The wrapper will skip sending another response
  }),
);

export default router;
```

###### 2\. **Custom Error Handling Without Redundant Boolean Return**

If you use a custom error handler that sends a response, you do not need to
return a boolean. The wrapper will check if a response has been sent and stop
further execution accordingly:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";
import { logger } from "netwrap";

const router = Router();

const customErrorHandler = (error, context, [req, res, next]) => {
  logger({ error, context });
  res.status(500).send("A custom error occurred");
};

router.get(
  "/example",
  wrapHandler(
    async (req, res, next, context) => {
      // Simulate an error
      throw new Error("Something went wrong");
    },
    {
      errorHandler: customErrorHandler, // Custom error handler
    },
  ),
);

export default router;
```

###### 3\. **Disabling Logging**

To disable logging for specific handlers, set the `logging` option to `false`:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(
    async (req, res, next, context) => {
      context.statusCode = 200;
      context.message = "Logging disabled for this operation";
      context.payload = { data: "No logging" };
      res.send(context.payload);
    },
    {
      logging: false, // Disable logging
    },
  ),
);

export default router;
```

#### Edge Cases

##### 1\. **Multiple Responses in Operation Function**

**Scenario**: The `operation` function may inadvertently send multiple responses
(e.g., due to asynchronous code paths).

**Description**: If the `operation` function sends multiple responses, such as
by having multiple calls to `res.send`, `res.json`, or `res.end` in different
code paths, this will result in an error since Express does not allow multiple
responses for the same request.

**Handling**: The wrapper will detect if a response has already been sent, and
it will skip further response handling. However, it's good practice to ensure
that the `operation` function only sends a single response.

**Example**:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    if (someCondition) {
      res.send("Response for some condition");
    } // Another asynchronous operation that might send a response

    if (anotherCondition) {
      res.send("Response for another condition"); // This will cause an error if both conditions are true
    }
  }),
);

export default router;
```

##### 2\. **Error in Error Handling Function**

**Scenario**: The custom `errorHandler` function itself throws an error.

**Description**: If the `errorHandler` function encounters an error while
processing or sending a response, it could lead to unexpected behavior or
unhandled exceptions.

**Handling**: Ensure that the `errorHandler` is robust and includes its own
error handling mechanisms if it performs complex operations.

**Example**:

```typescript
const customErrorHandler = (error, context, [req, res, next]) => {
  try {
    logger({ error, context });
    res.status(500).send("A custom error occurred");
  } catch (handlerError) {
    // Handle any errors thrown by the errorHandler itself
    logger({ handlerError, context });
    res.status(500).send("An error occurred while handling another error");
  }
};
```

##### 3\. **No Response Sent in Operation Function**

**Scenario**: The `operation` function does not send a response, and the request
remains open.

**Description**: If the `operation` function completes without sending a
response, the wrapper will send a response based on the last updated values in
the context.

**Handling**: Ensure that the `operation` function always sends a response or
sets the appropriate status and message in the `context`. Consider logging or
handling cases where no response is sent.

**Example**:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    // Operation logic that does not send a response
    context.statusCode = 204; // No content
    context.message = "No content provided";
  }),
);

export default router;
```

##### 4\. **Custom Error Handler Modifies Response Status**

**Scenario**: The custom `errorHandler` function sets a specific status code or
response headers.

**Description**: If the `errorHandler` modifies the response status code or
headers, ensure that the wrapper does not override these settings when sending
the final response.

**Handling**: The wrapper will respect the modifications made by the
`errorHandler`. Ensure that the final response aligns with what was set in the
`errorHandler`.

**Example**:

```typescript
const customErrorHandler = (error, context, [req, res, next]) => {
  logger({ error, context });
  res.status(400).send("Bad Request");
  // Status code is set to 400, which will be respected in the final response
};
```

##### 5\. **Operation Function Returns a Non-Promise Value**

**Scenario**: The `operation` function returns a non-promise value, but `await`
is used.

**Description**: If the `operation` function returns a non-promise value (e.g.,
synchronous code) but `await` is used, the code will still work correctly since
`await` on a non-promise resolves immediately. However, be mindful of mixed
synchronous and asynchronous code paths.

**Handling**: Ensure that the `operation` function is designed consistently, and
consider whether the use of `async/await` is appropriate.

**Example**:

```typescript
import wrapHandler from "@metrobuzz/express-request-handler";
import { Router } from "express";

const router = Router();

router.get(
  "/example",
  wrapHandler(async (req, res, next, context) => {
    // Synchronous logic
    context.statusCode = 200;
    context.message = "Synchronous response";
    context.payload = { data: "Example data" };
    res.send(context.payload); // Sends response synchronously
  }),
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
