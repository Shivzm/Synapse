package com.synapse.jobs;

import ai.vespa.feed.client.DocumentId;
import ai.vespa.feed.client.FeedClient;
import ai.vespa.feed.client.FeedClientBuilder;
import ai.vespa.feed.client.OperationParameters;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.flink.api.connector.sink2.Sink;
import org.apache.flink.api.connector.sink2.SinkWriter;
import org.apache.flink.api.connector.sink2.WriterInitContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;

public class VespaFeeder implements Sink<String> {
 
    private static final long serialVersionUID = 1L;
 
    // Vespa document namespace and schema — adjust to match your Vespa application
    private static final String VESPA_NAMESPACE = "synapse";
    private static final String VESPA_DOCUMENT_TYPE = "product";
 
    private final String vespaEndpoint;
 
    public VespaFeeder(String vespaEndpoint) {
        this.vespaEndpoint = vespaEndpoint;
    }
 
    /** Convenience constructor using the default local Vespa endpoint. */
    public VespaFeeder() {
        this("http://localhost:8080");
    }
 
    @SuppressWarnings("deprecation")
    @Override
    public SinkWriter<String> createWriter(Sink.InitContext context) throws IOException {
        return new Writer(vespaEndpoint);
    }

    // Future-proofs for Flink 2.0 — becomes the only method then
    @Override
    public SinkWriter<String> createWriter(WriterInitContext context) throws IOException {
        return new Writer(vespaEndpoint);
    }
 
    // -------------------------------------------------------------------------
    // Inner Writer — one instance per parallel task slot on the TaskManager.
    // Not serializable; all heavy resources (FeedClient) live here.
    // -------------------------------------------------------------------------
    static class Writer implements SinkWriter<String> {
 
        private static final Logger LOG = LoggerFactory.getLogger(Writer.class);
        private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
 
        private final FeedClient feedClient;
 
        Writer(String vespaEndpoint) {
            this.feedClient = FeedClientBuilder
                    .create(URI.create(vespaEndpoint))
                    .build();
            LOG.info("VespaFeeder.Writer: FeedClient initialized for {}", vespaEndpoint);
        }
 
        /**
         * Called for every record — replaces RichSinkFunction.invoke().
         *
         * Expected JSON shape: { "id": "123", "fields": { ... } }
         * The "id" field is used as the Vespa document ID suffix.
         */
        @Override
        public void write(String value, Context context) throws IOException {
            try {
                JsonNode root = OBJECT_MAPPER.readTree(value);
 
                if (!root.has("id")) {
                    LOG.warn("Skipping record with no 'id' field: {}", value);
                    return;
                }
 
                String docId = root.get("id").asText();
 
                // Builds: id:synapse:product::<docId>
                DocumentId documentId = DocumentId.of(VESPA_NAMESPACE, VESPA_DOCUMENT_TYPE, docId);
 
                // Vespa feed payload must be wrapped as {"fields": {...}}
                String feedPayload;
                if (root.has("fields")) {
                    feedPayload = OBJECT_MAPPER.writeValueAsString(
                            OBJECT_MAPPER.createObjectNode().set("fields", root.get("fields"))
                    );
                } else {
                    feedPayload = "{\"fields\": " + value + "}";
                }
 
                // Async put — errors are logged in the completion callback
                feedClient.put(documentId, feedPayload, OperationParameters.empty())
                        .whenComplete((result, error) -> {
                            if (error != null) {
                                LOG.error("Failed to feed document '{}': {}", docId, error.getMessage());
                            } else {
                                LOG.debug("Fed document '{}': type={}, message={}",
                                        docId,
                                        result.type(),
                                        result.resultMessage().orElse("ok"));
                            }
                        });
 
            } catch (Exception e) {
                LOG.error("VespaFeeder.Writer.write() failed to process record: {}", value, e);
            }
        }
 
        /**
         * Called on checkpoint and end-of-input.
         * The Vespa FeedClient delivers asynchronously and manages its own internal queue,
         * so there is nothing to flush explicitly here.
         */
        @Override
        public void flush(boolean endOfInput) {
            // no-op — Vespa client handles async delivery internally
        }
 
        @Override
        public void close() throws Exception {
            if (feedClient != null) {
                feedClient.close();
                LOG.info("VespaFeeder.Writer: FeedClient closed.");
            }
        }
    }
}
 