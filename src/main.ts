import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    forbidUnknownValues: true,
    validationError: { target: false },
  }));

  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API for URL shortening with OAuth2 and JWT authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    // Add API examples for Swagger UI
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 2,
      docExpansion: 'none',
      // Add example curl for login
      requestSnippetsEnabled: true,
      requestSnippets: [
        {
          label: 'cURL',
          description: 'Example: User login',
          code: `curl -X POST "http://localhost:3000/auth/login" -H "Content-Type: application/json" -d '{"username": "demo", "password": "password"}'`
        },
        {
          label: 'cURL',
          description: 'Example: Shorten URL',
          code: `curl -X POST "http://localhost:3000/urls/shorten" -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"originalUrl": "https://example.com"}'`
        },
        {
          label: 'cURL',
          description: 'Example: OAuth2 Token',
          code: `curl -X POST "http://localhost:3000/oauth/token" -H "Content-Type: application/json" -d '{"grant_type": "authorization_code", "code": "<code>", "client_id": "<clientId>", "client_secret": "<clientSecret>", "redirect_uri": "<redirectUri>"}'`
        }
      ]
    }
  });

  await app.listen(3000);
}
bootstrap();
