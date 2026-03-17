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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class UserProfileJob {
    private static final Logger LOG = LoggerFactory.getLogger(UserProfileJob.class);

    public static void main(String[] args) throws Exception {
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        // 1. Kafka Source for User Events
        KafkaSource<String> source = KafkaSource.<String>builder()
                .setBootstrapServers("localhost:9092")
                .setTopics("user-interactions")
                .setGroupId("synapse-profile-group")
                .setStartingOffsets(OffsetsInitializer.latest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        DataStream<String> stream = env.fromSource(source, WatermarkStrategy.noWatermarks(), "Kafka User Events");

        // 2. Write to ClickHouse using JDBC Sink
        stream.addSink(JdbcSink.sink(
                "INSERT INTO user_profiles (user_id, event_type, timestamp) VALUES (?, ?, ?)",
                (statement, jsonEvent) -> {
                    // In a real scenario, you'd use Jackson to parse jsonEvent here
                    // statement.setString(1, "user123"); 
                    // statement.setString(2, "click");
                    // statement.setLong(3, System.currentTimeMillis());
                },
                JdbcExecutionOptions.builder()
                        .withBatchSize(1000)       // ClickHouse loves large batches
                        .withBatchIntervalMs(200)
                        .withMaxRetries(5)
                        .build(),
                new JdbcConnectionOptions.JdbcConnectionOptionsBuilder()
                        .withUrl("jdbc:clickhouse://localhost:8123/synapse")
                        .withDriverName("com.clickhouse.jdbc.ClickHouseDriver")
                        .withUsername("default")
                        .withPassword("")
                        .build()
        ));

        env.execute("Synapse UserProfileJob");
    }
}