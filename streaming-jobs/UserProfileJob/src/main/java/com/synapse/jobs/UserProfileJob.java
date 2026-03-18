package com.synapse.jobs;

import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.jdbc.JdbcConnectionOptions;
import org.apache.flink.connector.jdbc.JdbcExecutionOptions;
import org.apache.flink.connector.jdbc.JdbcSink;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.apache.flink.streaming.api.functions.sink.SinkFunction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.sql.Timestamp;

public class UserProfileJob {
    private static final Logger LOG = LoggerFactory.getLogger(UserProfileJob.class);
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        // 1. Initialize MinIO (The GCS replacement)
        try {
            MinioService.initMinio();
            LOG.info("MinIO storage initialized successfully.");
        } catch (Exception e) {
            LOG.error("MinIO initialization failed. Ensure Docker is running!", e);
        }

        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 2. Kafka Source for User Events
        KafkaSource<String> source = KafkaSource.<String>builder()
                .setBootstrapServers("localhost:9092")
                .setTopics("user-interactions")
                .setGroupId("synapse-profile-group")
                .setStartingOffsets(OffsetsInitializer.latest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        DataStream<String> stream = env.fromSource(source, WatermarkStrategy.noWatermarks(), "Kafka User Events");

        // 3. Write to ClickHouse using JDBC Sink
        @SuppressWarnings("deprecation")
        SinkFunction<String> jdbcSink = JdbcSink.sink(
                "INSERT INTO user_profiles (user_id, event_type, timestamp) VALUES (?, ?, ?)",
                (statement, jsonString) -> {
                    try {
                        JsonNode json = OBJECT_MAPPER.readTree(jsonString);
 
                        statement.setString(1, json.get("user_id").asText());
                        statement.setString(2, json.get("event_type").asText());
 
                        long ts = json.has("timestamp")
                                ? json.get("timestamp").asLong()
                                : System.currentTimeMillis();
                        statement.setTimestamp(3, new Timestamp(ts));
 
                    } catch (Exception e) {
                        LOG.error("Failed to parse JSON or map to ClickHouse: {}", jsonString, e);
                    }
                },
                JdbcExecutionOptions.builder()
                        .withBatchSize(1000)
                        .withBatchIntervalMs(200)
                        .withMaxRetries(5)
                        .build(),
                new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
                        .withUrl("jdbc:clickhouse://localhost:8123/synapse")
                        .withDriverName("com.clickhouse.jdbc.ClickHouseDriver")
                        .withUsername("default")
                        .withPassword("")
                        .build()
        );
 
        //noinspection deprecation
        stream.addSink(jdbcSink);
 
        env.execute("Synapse UserProfileJob");
    }
}
 