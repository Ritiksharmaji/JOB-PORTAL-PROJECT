# Runtime-only image: the jar is built on your machine by deploy.sh, so the small
# 1 GB server never has to run Maven.
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY JobPortal.jar JobPortal.jar
EXPOSE 8080
# Cap the heap so the API fits next to Dabba on the shared 2 GB server.
ENV JAVA_TOOL_OPTIONS="-Xms128m -Xmx256m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -Xss512k"
ENTRYPOINT ["java", "-jar", "JobPortal.jar"]
