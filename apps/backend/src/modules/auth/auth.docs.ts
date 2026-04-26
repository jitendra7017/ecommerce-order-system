export const authDocs = {
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthRegisterRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "User registered",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AuthRegisterData" },
                    },
                  },
                ],
              },
            },
          },
        },
        400: {
          description: "Validation or duplicate email error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
        },
      },
    },
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AuthLoginRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  {
                    type: "object",
                    properties: {
                      data: { $ref: "#/components/schemas/AuthLoginData" },
                    },
                  },
                ],
              },
            },
          },
        },
        400: {
          description: "Invalid credentials or validation error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } },
        },
      },
    },
  },
};
