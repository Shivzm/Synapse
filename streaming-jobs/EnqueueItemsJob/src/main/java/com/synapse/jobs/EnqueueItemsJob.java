package com.synapse.jobs;

import org.apache.flink.api.common.eventtime.WatermarkStrategy;
import org.apache.flink.api.common.serialization.SimpleStringSchema;
import org.apache.flink.connector.kafka.source.KafkaSource;
import org.apache.flink.connector.kafka.source.enumerator.initializer.OffsetsInitializer;
import org.apache.flink.streaming.api.datastream.DataStream;
import org.apache.flink.streaming.api.environment.StreamExecutionEnvironment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Synapse Streaming Job: EnqueueItems
 * Reads product updates from Kafka and pushes them to Vespa for real-time search indexing.
 */
public class EnqueueItemsJob {
    private static final Logger LOG = LoggerFactory.getLogger(EnqueueItemsJob.class);

    public static void main(String[] args) throws Exception {
        // 1. Set up the Flink execution environment
        final StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();
        
        LOG.info("Initializing Synapse EnqueueItemsJob...");

        // 2. Configure Kafka Source
        // Replace "localhost:9092" and "product-updates" with your actual config
        KafkaSource<String> source = KafkaSource.<String>builder()
                .setBootstrapServers("localhost:9092")
                .setTopics("product-updates")
                .setGroupId("synapse-enqueue-group")
                .setStartingOffsets(OffsetsInitializer.earliest())
                .setValueOnlyDeserializer(new SimpleStringSchema())
                .build();

        // 3. Create the DataStream
        DataStream<String> stream = env.fromSource(source, WatermarkStrategy.noWatermarks(), "Kafka Product Updates");

        // 4. Process and Sink to Vespa
        // We use a custom MapFunction or Sink to handle the Vespa Feed Client logic
        stream.map(value -> {
            LOG.debug("Received item from Kafka: {}", value);
            return value;
        }).addSink(new VespaFeeder()); // We will create this class next

        // 5. Execute the job
        env.execute("Synapse EnqueueItemsJob");
    }
}