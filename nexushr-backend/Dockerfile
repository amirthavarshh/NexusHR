FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S nexushr && adduser -S nexushr -G nexushr
USER nexushr

# Copy the jar from the host build directory
COPY build/libs/*.jar app.jar

# Expose Spring Boot's default port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
