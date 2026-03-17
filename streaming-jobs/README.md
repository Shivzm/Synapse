# Streaming Jobs

A multi-module Maven project for Apache Flink streaming jobs that power the Synapse data pipeline.

## Project Structure

```
streaming-jobs/ (Root)
├── pom.xml (Parent POM)
├── README.md
│
├── EnqueueItemsJob/
│   ├── pom.xml (Child)
│   └── src/main/
│       ├── java/com/synapse/jobs/
│       │   ├── EnqueueItemsJob.java
│       │   ├── ItemProcessor.java
│       │   └── VespaFeeder.java
│       └── resources/
│
└── UserProfileJob/
    ├── pom.xml (Child)
    └── src/main/
        ├── java/com/synapse/jobs/
        │   ├── ClickHouseWriter.java
        │   ├── UserProfileAggregator.java
        │   └── UserProfileJob.java
        └── resources/
```

## Modules

### EnqueueItemsJob

Processes item click events from Kafka and feeds them into Vespa for ranking and indexing.

**Components:**

- `EnqueueItemsJob.java` - Main entry point for the Flink job
- `ItemProcessor.java` - Processes and transforms item data
- `VespaFeeder.java` - Handles feeding data into Vespa

**Dependencies:**

- Apache Flink 1.20.2
- Kafka Connector
- Vespa Feed Client 8.656.31
- Flink JSON

### UserProfileJob

Aggregates user interactions and writes user profiles to ClickHouse for analytics and ML training.

**Components:**

- `UserProfileJob.java` - Main entry point for the Flink job
- `UserProfileAggregator.java` - Aggregates user behavior and interactions
- `ClickHouseWriter.java` - Writes aggregated profiles to ClickHouse

**Dependencies:**

- Apache Flink 1.20.2
- Kafka Connector
- JDBC Connector 3.3.0-1.20
- ClickHouse JDBC 0.6.3

## Building

### Build all modules

```bash
mvn clean install
```

### Build a specific module

```bash
cd EnqueueItemsJob
mvn clean package
```

Or from root:

```bash
mvn clean package -pl EnqueueItemsJob
```

### Build without running tests

```bash
mvn clean install -DskipTests
```

## Configuration

Each module has its own `pom.xml` that inherits from the parent POM. The parent POM defines:

- Common properties (Java version, Flink version)
- Dependency versions via `<dependencyManagement>`
- Build plugins and configurations

## Requirements

- Java 17+
- Maven 3.6+
- Apache Flink 1.20.2+
- Kafka cluster
- ClickHouse (for UserProfileJob)
- Vespa cluster (for EnqueueItemsJob)

## Running the Jobs

Jobs can be submitted to a Flink cluster using the Flink CLI:

```bash
flink run -c com.synapse.jobs.EnqueueItemsJob ./EnqueueItemsJob/target/enqueue-items-job-*.jar
flink run -c com.synapse.jobs.UserProfileJob ./UserProfileJob/target/user-profile-job-*.jar
```

## Contributing

When adding new classes to a job:

1. Place them in the `src/main/java/com/synapse/jobs/` directory
2. Update the module's `pom.xml` if new dependencies are needed
3. If dependencies are shared across modules, add them to the parent POM's `<dependencyManagement>`
