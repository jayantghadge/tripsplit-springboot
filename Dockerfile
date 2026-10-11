# Backend-only image. Frontend is deployed separately on Netlify.
FROM gradle:8.10-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
COPY src ./src
RUN chmod +x gradlew && ./gradlew build -x test --no-daemon

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]
