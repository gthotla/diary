// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Diary App API',
      version: '1.0.0',
      description: 'API documentation for the Diary App with MongoDB CSFLE',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Adjust path to your route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
