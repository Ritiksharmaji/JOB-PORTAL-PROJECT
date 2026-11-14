# One runtime image for every module. scripts/up.sh builds the jars with Maven first,
# so the images only copy a jar (fast builds, no Maven inside Docker).
FROM eclipse-temurin:17-jre-jammy
ARG MODULE
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY ${MODULE}/target/*.jar app.jar
# Heap follows the container memory limit set in docker-compose.yml.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=65 -XX:+UseSerialGC -Xss512k -XX:MaxMetaspaceSize=128m"
ENTRYPOINT ["java", "-jar", "app.jar"]
