# Step 1 — Build Stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn -q -e dependency:go-offline

COPY src ./src
RUN mvn -q -e package -DskipTests

# Step 2 — Run Stage
FROM eclipse-temurin:21-jdk
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]