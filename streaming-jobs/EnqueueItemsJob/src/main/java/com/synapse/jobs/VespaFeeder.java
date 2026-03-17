package com.synapse.jobs;

import ai.vespa.feed.client.*;
import org.apache.flink.configuration.Configuration;
import org.apache.flink.streaming.api.functions.sink.RichSinkFunction;
import java.net.URI;

public class VespaFeeder extends RichSinkFunction<String> {
    private transient FeedClient feedClient;

    @Override
    public void open(Configuration parameters) throws Exception {
        // Initialize Vespa Feed Client
        feedClient = FeedClientBuilder.create(URI.create("http://localhost:8080")).build();
    }

    @Override
    public void invoke(String value, Context context) {
        // Here you would parse the JSON and define the Vespa Document ID
        // For example: "id:mynamespace:product::123"
        // feedClient.put(DocumentId.of("id:synapse:product::1"), value, FeedClient.OperationParameters.empty());
    }

    @Override
    public void close() throws Exception {
        if (feedClient != null) {
            feedClient.close();
        }
    }
}