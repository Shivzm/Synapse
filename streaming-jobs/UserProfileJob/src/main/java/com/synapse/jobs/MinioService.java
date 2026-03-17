package com.synapse.jobs;

import io.minio.MinioClient;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;

public class MinioService {
    public static void initMinio() throws Exception {
        // Connect to the MinIO container started by your docker-compose
        MinioClient minioClient = MinioClient.builder()
                .endpoint("http://localhost:9000")
                .credentials("minioadmin", "minioadmin") // Default credentials
                .build();

        // Check if our Synapse bucket exists, create it if not
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket("synapse-data").build());
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket("synapse-data").build());
            System.out.println("Bucket 'synapse-data' created successfully.");
        }
    }
}