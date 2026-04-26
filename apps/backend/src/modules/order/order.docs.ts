export const orderDocs = {
  "/api/orders": {
    get: {
      tags: ["Order"],
      summary: "Get order history with pagination",
      security: [{ bearerAuth: [] }],
      parameters: [
        { in: "query", name: "page", schema: { type: "integer", minimum: 1, default: 1 } },
        { in: "query", name: "limit", schema: { type: "integer", minimum: 1, default: 10 } },
      ],
      responses: {
        200: {
          description: "Order history fetched",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/OrderListData" } } },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Order"],
      summary: "Place order from cart using DB transaction",
      security: [{ bearerAuth: [] }],
      responses: {
        201: {
          description: "Order placed",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/orders/{id}/cancel": {
    post: {
      tags: ["Order"],
      summary: "Cancel order and restore stock",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer", minimum: 1 } }],
      responses: {
        200: {
          description: "Order cancelled",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/Order" } } },
                ],
              },
            },
          },
        },
      },
    },
  },
};
