export const cartDocs = {
  "/api/cart": {
    get: {
      tags: ["Cart"],
      summary: "Get current user's cart",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Cart fetched",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/CartGetData" } } },
                ],
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Cart"],
      summary: "Add product to cart",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToCartRequest" },
          },
        },
      },
      responses: {
        201: {
          description: "Cart item added",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/CartItemRow" } } },
                ],
              },
            },
          },
        },
      },
    },
  },
  "/api/cart/{productId}": {
    put: {
      tags: ["Cart"],
      summary: "Update cart item quantity",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "productId", required: true, schema: { type: "integer", minimum: 1 } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateCartItemRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Cart item updated",
          content: {
            "application/json": {
              schema: {
                allOf: [
                  { $ref: "#/components/schemas/ApiSuccess" },
                  { type: "object", properties: { data: { $ref: "#/components/schemas/CartItemRow" } } },
                ],
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ["Cart"],
      summary: "Remove cart item",
      security: [{ bearerAuth: [] }],
      parameters: [{ in: "path", name: "productId", required: true, schema: { type: "integer", minimum: 1 } }],
      responses: {
        200: {
          description: "Cart item removed",
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
