package com.synapse.jobs;

import org.apache.flink.streaming.api.functions.ProcessFunction;
import org.apache.flink.util.Collector;

public class ClickHouseWriter extends ProcessFunction<String, String> {
    @Override
    public void processElement(String value, Context ctx, Collector<String> out) {
        // Here you would implement logic like:
        // 1. Parse JSON
        // 2. Check if user profile exists in ClickHouse
        // 3. Increment interaction counts
        out.collect(value);
    }
}