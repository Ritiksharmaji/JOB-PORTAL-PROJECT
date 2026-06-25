# Build stage — compile the jar with Maven + JDK 17 (modern Temurin image)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Run stage — current Temurin JRE (modern TLS; fixes Atlas SSL handshake errors)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/JobPortal-0.0.1-SNAPSHOT.jar JobPortal.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","JobPortal.jar"]
