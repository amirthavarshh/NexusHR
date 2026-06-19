# Stage 1: Build the application
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy gradle files for caching dependencies
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .

# Grant execute permission for the gradle wrapper
RUN chmod +x gradlew

# Download dependencies (empty build to cache)
RUN ./gradlew dependencies --no-daemon || true

# Copy the source code and build the application
COPY src src
RUN ./gradlew bootJar -x test --no-daemon

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-root user for security
RUN addgroup -S nexushr && adduser -S nexushr -G nexushr
USER nexushr

# Copy the jar from the build stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose Spring Boot's default port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
