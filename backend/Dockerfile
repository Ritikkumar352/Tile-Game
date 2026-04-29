# Stage 1: build
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /app

COPY pom.xml .

COPY src ./src

RUN mvn -q package -DskipTests

# Stage 2: runtime
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
