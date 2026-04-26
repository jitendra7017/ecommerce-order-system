export const categoryDocs = {
  "/api/categories": {
    get: {
      tags: ["Category"],
      summary: "List categories",
      responses: {
        200: {
          description: "Category list",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  {
                    type: "object",
                    properties: {
                      data: { type: "array", items: { $ref: "#/components/schemas/Category" } },
                    },
                  },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Category"],
      summary: "Create category (admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateCategoryRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Category created",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/Category" } } },
                ],
              },
            },
          },
        },
      },
    },
  },
};
