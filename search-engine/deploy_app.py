from vespa.package import ApplicationPackage, Field, Schema, Document, RankProfile, HNSW
from vespa.deployment import VespaDocker

# 1. Define the Data Schema for your unique items
# This replaces the manual 'item.sd' file for rapid prototyping
app_package = ApplicationPackage(name="nexusrank")

app_package.schema.add_fields(
    # Basic text fields
    Field(name="item_id", type="string", indexing=["summary", "attribute"]),
    Field(name="title", type="string", indexing=["index", "summary"], index="enable-bm25"),
    Field(name="description", type="string", indexing=["index", "summary"], index="enable-bm25"),
    
    # Vector field for Semantic Search (Meaning-based search)
    # Using HNSW for sub-millisecond 'nearest neighbor' search
    Field(
        name="embedding", 
        type="tensor<float>(x[384])", # Matches common NLP models like 'all-MiniLM-L6-v2'
        indexing=["attribute", "index"], 
        ann=HNSW(distance_metric="euclidean")
    )
)

# 2. Define how to Rank items (Personalization Layer)
# 'first-phase' is the fast math; 'second-phase' is where your complex ML goes
app_package.schema.add_rank_profile(
    RankProfile(
        name="personalized_ranking",
        first_phase="bm25(title) + closeness(field, embedding)",
        # In a real project, you'd add your ONNX model here for the second phase:
        # second_phase="onnxModel(ranking_model).score"
    )
)

# 3. Deploy to your Local Docker Container
# This assumes your 'docker-compose.yml' from earlier is already running
vespa_docker = VespaDocker(container_memory="4G")
app = vespa_docker.deploy(application_package=app_package)

print(f"🚀 Project NexusRank is live at: {app.url}")