export const productDocs = {
  "/api/products": {
    get: {
      tags: ["Product"],
      summary: "List products with pagination/filter/search",
      parameters: [
        { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
        { in: "query", name: "limit", schema: { type: "integer", minimum: 1, default: 10 } },
        { in: "query", name: "search", schema: { type: "string" } },
        { in: "query", name: "categoryId", schema: { type: "integer", minimum: 1 } },
      ],
      responses: {
        200: {
          description: "Product list",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/ProductListData" } } },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Product"],
      summary: "Create product (admin)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpsertProductRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Product created",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/Product" } } },
                ],
              },
            },
          },
        },
        401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
        403: { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ApiError" } } } },
      },
    },
  },
  "/api/products/{id}": {
    put: {
      tags: ["Product"],
      summary: "Update product (admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpsertProductRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Product updated",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/Product" } } },
                ],
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Product"],
      summary: "Delete product (admin)",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
      responses: {
        200: {
          description: "Product soft deleted",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { type: "null", nullable: true, example: null } } },
                ],
              },
            },
          },
        },
      },
    },
  },
};
