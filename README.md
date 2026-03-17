# Synapse: High-Performance Search Aggregator

## 🎯 Project Overview

**Synapse** is a high-performance search aggregator that enables users to discover millions of unique, non-standard items through a fast, personalized, and highly relevant search experience. Think of it as "Google for Shopping" or a "Super-Aggregator" — an intelligent layer that ingests data from multiple sources, ranks items using AI, and serves results in milliseconds.

### Business Challenge

E-commerce platforms often struggle with:

- **Scale**: Managing millions of unique, non-standard items
- **Relevance**: Providing truly personalized search results, not just text matches
- **Speed**: Serving results within milliseconds while processing real-time user interactions
- **Intelligence**: Using machine learning to understand user intent and predict preferences

**Synapse solves this** by building a real-time, AI-powered search infrastructure that learns from every user interaction and continuously improves ranking accuracy.

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      UPSTREAM DATA SOURCES                      │
│              (New Item Listings, User Interactions)              │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ├─ Item Listings → Cloud Storage (MinIO)
            └─ Kafka Events → Apache Kafka Topics
                  ├─ "NewItems"
                  └─ "UserInteractions"
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│          REAL-TIME STREAMING LAYER (Apache Flink)               │
│    • NLP Feature Extraction                                      │
│    • Stream Joins & Enrichment                                   │
│    • ML Model Application                                        │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ├─────────────────────┬──────────────────────┐
            ▼                     ▼                      ▼
    ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │  ClickHouse     │  │  Vespa Search    │  │  Analytics API   │
    │  (Feature Store)│  │  (Serving Index) │  │  (Dashboards)    │
    └─────────────────┘  └──────────────────┘  └──────────────────┘
            │                     │
            └─────────┬───────────┘
                      ▼
    ┌─────────────────────────────────────┐
    │   ML Training Pipeline (PyTorch)    │
    │   • Learns from Historical Data     │
    │   • Trains Ranking Models           │
    │   • Deploys to Vespa                │
    └─────────────────────────────────────┘
            │
            ▼
    ┌──────────────────────────────────────┐
    │   User Searches (Frontend/React)     │
    │   • Query to Vespa                   │
    │   • Personalized Results             │
    │   • Millisecond Response Times       │
    └──────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Rationale

### Core Components

| Component                   | Technology         | Why This Choice                                    | Role                                        |
| --------------------------- | ------------------ | -------------------------------------------------- | ------------------------------------------- |
| **Object Storage**          | MinIO              | S3-compatible, self-hosted, open-source            | Store raw item assets (images, documents)   |
| **Event Streaming**         | Apache Kafka       | High-throughput, fault-tolerant, industry standard | Coordinate data flow between services       |
| **Stream Processing**       | Apache Flink       | Stateful processing, complex joins, low latency    | Enrich and transform data in real-time      |
| **Data Warehouse**          | ClickHouse         | Columnar, OLAP optimized, SQL interface            | Feature store for ML training and analytics |
| **Search Engine**           | Vespa.ai           | Built-in ML ranking, vector search, distributed    | Serve search results with custom ML models  |
| **ML Training**             | PyTorch            | Dominant in industry, ONNX export support          | Train personalization and ranking models    |
| **Container Orchestration** | Kubernetes (K8s)   | Production-ready, auto-scaling, cloud-native       | Deploy and scale all services               |
| **Data Ingestion**          | FastAPI (Python)   | High performance, async, easy Kafka integration    | Accept item uploads and user events         |
| **Frontend**                | React (TypeScript) | Fast, responsive, modern UX                        | User search interface and dashboards        |

---

## 📊 Data Flow: End-to-End

### Step 1: Data Ingestion (Trigger Event)

```
SELLER ACTION: Upload a new item
    ↓
FastAPI Endpoint (/api/items/upload)
    ├─ Receive item metadata (title, description, price, images)
    ├─ Upload images to MinIO (S3-compatible storage)
    └─ Publish JSON message to Kafka "NewItems" topic

Example Kafka Message:
{
  "item_id": "123456",
  "title": "Vintage Edison Bulb Lamp",
  "seller_id": "seller_bob_123",
  "description": "Handcrafted lamp from 1920s, authentic design...",
  "price": 149.99,
  "category": "home_decor",
  "image_urls": ["s3://minio/items/123456/img1.jpg"],
  "timestamp": "2026-03-16T10:30:00Z"
}
```

### Step 2: Real-Time Enrichment (Apache Flink Stream Processing)

```
Flink subscribes to Kafka topics:

INPUT:
  • "NewItems" → Raw item listings
  • "UserInteractions" → Clicks, views, purchases

PROCESSING PIPELINE:
  1. NLP Feature Extraction
     └─ Convert item description → Dense vector (384 dimensions)
        using a transformer model (e.g., sentence-transformers)

  2. Stream Joins
     └─ Join current item with historical user interaction patterns
        (trending items, category preferences, seasonal signals)

  3. Data Enrichment
     └─ Add computed features:
        - Category embeddings
        - Seller reputation score
        - Price comparison features
        - Stock availability signals

  4. Hot Path Processing
     └─ Filter for real-time analytics (top trending items)

OUTPUT (formatted search documents):
{
  "item_id": "123456",
  "title": "Vintage Edison Bulb Lamp",
  "description": "Handcrafted lamp from 1920s, authentic design...",
  "price": 149.99,
  "embedding": [0.234, -0.567, 0.890, ...],  // 384-dim vector
  "category": "home_decor",
  "category_embedding": [0.123, 0.456, ...],
  "seller_reputation": 4.8,
  "trending_score": 0.75,
  "availability": "in_stock",
  "timestamp": "2026-03-16T10:30:15Z"
}
```

### Step 3: Dual Writes (Persistence & Indexing)

```
Flink simultaneously sends enriched data to two destinations:

1. CLICKHOUSE (Data Lakehouse / Feature Store)
   └─ Writes to table: items_enriched
   └─ Retains all historical data for:
      • ML model training
      • Analytics & dashboards
      • Feature engineering
      • Backfills and model retraining

2. VESPA (Search Index & Serving Engine)
   └─ Pushes via Vespa feed API over HTTPS
   └─ Vespa indexes:
      • Text fields (title, description) → BM25
      • Categorical fields → Exact match & filters
      • Vector embeddings → Approximate nearest neighbor (ANN)
      • Numerical features → Ranking signals
```

### Step 4: User Search Query

```
USER ACTION: Types in search box
    │
    ├─ Query reaches React Frontend
    ├─ Sends HTTP request to Vespa (or via API gateway)
    │
    ▼
VESPA SEARCH PHASE 1: Candidate Retrieval
    ├─ Text Match: BM25 over title/description (top 1000)
    ├─ Vector Match: ANN search on embeddings (top 1000)
    └─ Combine & deduplicate → ~500 candidates

    ▼
VESPA RANKING PHASE 2: ML Model Re-ranking
    ├─ For each candidate, extract features:
    │  • Text relevance score
    │  • Vector similarity
    │  • Category match
    │  • Seller reputation
    │  • User interaction history
    │  • Price competitiveness
    │
    ├─ Apply user-specific ML model (e.g., LightGBM, ONNX)
    │  deployed directly inside Vespa
    │
    └─ Return personalized ranking: top 10-20 items

    ▼
RESPONSE: ~50-100ms total latency
    {
      "results": [
        {
          "item_id": "123456",
          "title": "Vintage Edison Bulb Lamp",
          "price": 149.99,
          "relevance_score": 0.95,
          "seller": "seller_bob_123",
          "rating": 4.8
        },
        ...
      ],
      "total_hits": 12500,
      "query_time_ms": 45
    }
```

### Step 5: Feedback Loop (User Interactions)

```
USER INTERACTIONS: Click, view, purchase, add to cart
    │
    ├─ Tracked by Frontend TypeScript
    ├─ Sent to Python FastAPI backend (/api/events/click, etc.)
    │
    ▼
PUBLISH TO KAFKA "UserInteractions" topic:
{
  "event_type": "click",
  "user_id": "user_alice_456",
  "item_id": "123456",
  "session_id": "sess_xyz789",
  "query": "vintage lamp",
  "position": 1,
  "timestamp": "2026-03-16T10:32:00Z"
}

    ▼
FLINK STREAMING AGGREGATION:
    • Real-time user profiles (personalization signals)
    • Trending item detection
    • Category preferences per user segment
    • Feeds back into re-ranking models

    ▼
PERIODIC ML MODEL RETRAINING:
    • Query ClickHouse: "Show me 30 days of user interactions"
    • Extract features from enriched items
    • Train new ranking model (daily/weekly)
    • Deploy as ONNX to Vespa
```

---

## 📁 Project Structure

```
Synapse/
│
├─ README.md (this file)
├─ pyproject.toml              # Root project configuration
├─ main.py                      # CLI entry point
│
├─ infrastructure/              # Deployment & orchestration
│   ├─ docker-compose.yml      # Local development stack
│   │  ├─ Kafka cluster
│   │  ├─ MinIO storage
│   │  ├─ ClickHouse server
│   │  ├─ Vespa container
│   │  └─ Flink cluster
│   │
│   └─ kubernetes/             # Production K8s manifests
│       ├─ kafka-deployment.yaml
│       ├─ flink-deployment.yaml
│       ├─ vespa-statefulset.yaml
│       ├─ clickhouse-statefulset.yaml
│       ├─ minio-deployment.yaml
│       └─ api-deployment.yaml
│
├─ data-producers/             # Microservices: Generate data
│   │
│   ├─ item-lister/           # Item upload & listing API
│   │   ├─ app.py              # FastAPI server
│   │   ├─ schemas.py          # Pydantic models
│   │   ├─ s3_client.py        # MinIO integration
│   │   ├─ kafka_producer.py   # Kafka publishing
│   │   └─ requirements.txt    # Dependencies
│   │
│   └─ click-tracker/          # User interaction tracker
│       ├─ app.py              # FastAPI server
│       ├─ events.py           # Event models
│       ├─ kafka_producer.py   # Kafka publishing
│       └─ requirements.txt    # Dependencies
│
├─ streaming-jobs/             # Apache Flink Jobs (Stream Processing)
│   ├─ pom.xml                 # Parent POM (multi-module build)
│   ├─ README.md               # Flink job documentation
│   │
│   ├─ EnqueueItemsJob/        # Process new items
│   │   ├─ pom.xml             # Child POM
│   │   └─ src/main/
│   │       ├─ java/com/synapse/jobs/
│   │       │   ├─ EnqueueItemsJob.java
│   │       │   ├─ ItemProcessor.java
│   │       │   └─ VespaFeeder.java
│   │       └─ resources/
│   │
│   └─ UserProfileJob/         # Aggregate user interactions
│       ├─ pom.xml             # Child POM
│       └─ src/main/
│           ├─ java/com/synapse/jobs/
│           │   ├─ UserProfileJob.java
│           │   ├─ UserProfileAggregator.java
│           │   └─ ClickHouseWriter.java
│           └─ resources/
│
├─ search-engine/              # Vespa Configuration
│   │
│   ├─ schemas/
│   │   └─ item.sd             # Search definition (index schema)
│   │                           # Defines:
│   │                           # - Document structure (fields, types)
│   │                           # - Ranking functions
│   │                           # - ML model integration points
│   │
│   ├─ models/                 # ML Models for Vespa
│   │   ├─ ranking.onnx        # LightGBM model (ONNX format)
│   │   ├─ embeddings.onnx     # Vector embedding model
│   │   └─ README.md           # Model versioning & updates
│   │
│   ├─ services.xml            # Vespa cluster configuration
│   │                           # - Node topology
│   │                           # - Search chains
│   │                           # - Container setup
│   │
│   └─ README.md              # Vespa setup guide
│
├─ ml-training/                # Data Science / Model Training
│   │
│   ├─ train_ranking.py        # Main training script
│   │                           # 1. Query ClickHouse for labeled data
│   │                           # 2. Feature engineering
│   │                           # 3. Train LightGBM model
│   │                           # 4. Export to ONNX
│   │                           # 5. Push to Vespa
│   │
│   ├─ GPUtest.py              # Verify GPU/Intel Arc availability
│   ├─ pyproject.toml          # ML dependencies
│   │   ├─ pytorch
│   │   ├─ lightgbm
│   │   ├─ clickhouse-driver
│   │   ├─ numpy, pandas, scikit-learn
│   │   └─ onnx
│   │
│   └─ notebooks/ (optional)   # Jupyter notebooks for EDA
│
└─ frontend/                   # React TypeScript Web App
    │
    ├─ package.json            # Node.js dependencies
    ├─ tsconfig.json           # TypeScript configuration
    ├─ vite.config.ts          # Vite bundler config
    ├─ tailwind.config.ts      # CSS utility framework
    ├─ index.html              # Entry HTML file
    │
    ├─ public/                 # Static assets
    │
    └─ src/
        ├─ main.tsx            # React app entry point
        ├─ App.tsx             # Main component
        ├─ index.css           # Global styles
        ├─ App.css             # App-specific styles
        │
        └─ components/
            ├─ AgenticSearchBar.tsx      # AI-powered search input
            ├─ BentoResultsGrid.tsx      # Results display (bento layout)
            ├─ ExpandingSearchBar.tsx    # Interactive search bar
            ├─ FilteringSidebar.tsx      # Faceted filters
            ├─ KnowledgeGraphBackground.tsx  # Visual background animation
            ├─ NeuralButton.tsx          # Custom button component
            ├─ NeuralNavigation.tsx      # Navigation bar
            ├─ PerformanceDashboard.tsx  # Analytics display
            └─ index.ts                  # Component exports
```

---

## ⚙️ Component Deep-Dive

### 1. **Data Ingestion Layer (FastAPI)**

**Location**: `data-producers/`

**Responsibilities**:

- Accept HTTP requests for new item listings
- Validate and transform item metadata
- Upload images/assets to MinIO
- Publish events to Apache Kafka

**Technologies**: Python, FastAPI, Boto3 (AWS S3 SDK), confluent-kafka

**Key Endpoints**:

```
POST /api/items/upload
  - Receives: item metadata (title, description, price, images)
  - Returns: item_id, storage URLs
  - Publishes to: Kafka topic "NewItems"

POST /api/events/click
  - Receives: user_id, item_id, session_id, position
  - Returns: 200 OK
  - Publishes to: Kafka topic "UserInteractions"

POST /api/events/view
  - Tracks item views

POST /api/events/purchase
  - Tracks purchases for ranking signals
```

---

### 2. **Message Streaming (Apache Kafka)**

**Architecture**:

- Multi-broker cluster (typically 3+ nodes for fault tolerance)
- Topics partition data for parallel consumption
- Retention: 7-30 days (configurable)

**Topics in Use**:

```
1. NewItems
   - Partitions: 6 (for parallel processing)
   - Partitioning Key: seller_id (co-locate items by seller)
   - Retention: 7 days
   - Subscribers: Flink EnqueueItemsJob, Monitoring

2. UserInteractions
   - Partitions: 12 (high-volume, parallel aggregation)
   - Partitioning Key: user_id (co-locate user events)
   - Retention: 30 days
   - Subscribers: Flink UserProfileJob, Analytics

3. SearchQueries (optional, for analytics)
   - Partitions: 3
   - Retention: 7 days
   - Subscribers: Analytics dashboard
```

---

### 3. **Stream Processing (Apache Flink)**

**Language**: Java (for better memory management at scale)

**Two Main Jobs**:

#### 3a. **EnqueueItemsJob**

```
Input:  Kafka "NewItems" topic
        │
        ├─ NLP Feature Extraction
        │  └─ item.description → 384-dim embedding (transformer model)
        │
        ├─ Feature Engineering
        │  ├─ text cleaning & tokenization
        │  ├─ category classification
        │  └─ price normalization
        │
        ├─ Join with reference data
        │  └─ seller reputation from external DB
        │
        ├─ Output to ClickHouse
        │  └─ INSERT into items_enriched table
        │
        └─ Output to Vespa
           └─ HTTP POST to Vespa feed endpoint
```

**Deployment**: Runs continuously on Flink cluster (auto-restart on failure)

#### 3b. **UserProfileJob**

```
Input:  Kafka "UserInteractions" topic
        │
        ├─ Windowed Aggregation
        │  ├─ Group by user_id
        │  ├─ Tumble window: 5 minutes
        │  └─ Aggregate: category preferences, click patterns
        │
        ├─ Calculate Signals
        │  ├─ most_viewed_categories
        │  ├─ average_price_range
        │  ├─ click_through_rate
        │  └─ conversion_rate
        │
        └─ Sink to ClickHouse
           └─ INSERT into user_profiles table
              (continuously updated)
```

**Language**: Java + Flink API
**Parallelism**: Configurable based on cluster size
**State Management**: RocksDB for fault-tolerant state

---

### 4. **Search Index & Serving (Vespa.ai)**

**Location**: `search-engine/`

**Core Files**:

#### `schemas/item.sd` (Search Definition)

```
Defines the structure of searchable documents and ranking logic.

Example structure:
document item {
  field item_id type string { ... }
  field title type string { ... }
  field description type string { ... }
  field price type int { ... }
  field embedding type tensor(x[384]) { ... }
  field category_embedding type tensor(x[64]) { ... }
  field seller_reputation type double { ... }
  field trending_score type double { ... }
}

Ranking profiles:
  • default: BM25 + vector similarity
  • personalized: applies ML model
  • price_optimized: emphasizes price signals
```

#### `services.xml` (Cluster Configuration)

```
Defines:
- Number of search nodes
- Content nodes (data storage)
- Query processing chains
- Container configuration
- ML model deployment
```

#### `models/` (Machine Learning)

```
ranking.onnx:
  - Input: [user_embedding, item_embedding, seller_score, price, ...]
  - Output: ranking_score (0-1)
  - Framework: Originally trained in PyTorch/TensorFlow, exported as ONNX
  - Deployed at runtime inside Vespa container
```

**Search Flow**:

```
User Query: "vintage lamp"
    │
    ├─ MATCH PHASE (retrieve candidates)
    │  ├─ Text search: BM25 on title/description
    │  ├─ Vector search: ANN on embeddings
    │  └─ Combine: return 500 best candidates
    │
    ├─ RANK PHASE (personalized re-ranking)
    │  ├─ Extract features for each candidate
    │  ├─ Pass through ML model (ONNX)
    │  └─ Sort by predicted relevance
    │
    └─ RESULT PHASE (format response)
       └─ Return top 20 results with metadata
```

**Latency**: Typical 50-150ms for complex queries

---

### 5. **Data Warehouse (ClickHouse)**

**Purpose**: Store enriched data for analytics and ML training

**Schema Example**:

```sql
CREATE TABLE items_enriched (
  item_id String,
  title String,
  description String,
  price UInt32,
  embedding Array(Float32),  -- 384-dim vectors
  category String,
  seller_id String,
  seller_reputation Float32,
  trending_score Float32,
  created_at DateTime,
  updated_at DateTime
) ENGINE = MergeTree()
ORDER BY (created_at, item_id)
PARTITION BY toYYYYMM(created_at);

CREATE TABLE user_profiles (
  user_id String,
  most_viewed_categories Array(String),
  avg_price_range Tuple(min UInt32, max UInt32),
  click_through_rate Float32,
  conversion_rate Float32,
  last_updated DateTime
) ENGINE = ReplacingMergeTree()
ORDER BY user_id;

CREATE TABLE user_interactions (
  user_id String,
  item_id String,
  event_type Enum('click', 'view', 'purchase', 'cart_add'),
  session_id String,
  query String,
  position UInt8,
  timestamp DateTime
) ENGINE = MergeTree()
ORDER BY (timestamp, user_id)
PARTITION BY toYYYYMM(timestamp);
```

**Query Example** (for ML training):

```sql
SELECT
  item_id,
  title,
  price,
  category,
  count(*) as click_count,
  uniq(user_id) as unique_users,
  avg(position) as avg_click_position
FROM user_interactions
WHERE timestamp >= now() - interval 30 day
  AND event_type = 'click'
GROUP BY item_id, title, price, category
ORDER BY click_count DESC
LIMIT 10000;
```

**Retention**: 1-2 years (adjust based on budget)

---

### 6. **Machine Learning Training (PyTorch)**

**Location**: `ml-training/train_ranking.py`

**Workflow**:

```python
# 1. Query ClickHouse for training data
# 2. Feature Engineering
#    - Text features (TF-IDF, embeddings)
#    - Item features (price, category, seller_rep)
#    - User features (profile, history)
#    - Interaction features (CTR, position bias)
# 3. Train LightGBM or PyTorch model
# 4. Evaluate on holdout test set
# 5. Export to ONNX format
# 6. Deploy to Vespa via API
# 7. Monitor performance on live traffic
```

**Hardware**: GPU acceleration via PyTorch (supports NVIDIA, Intel Arc)

**Typical Training Schedule**:

- Daily: Parameter tuning on new data
- Weekly: Full model retraining
- Monthly: Experiment with new features/architectures

---

### 7. **Frontend (React + TypeScript)**

**Location**: `frontend/`

**Key Features**:

- Fast, responsive search interface
- Real-time autocomplete suggestions
- Faceted search filters (category, price, seller)
- Analytics dashboard (trending items, user engagement)
- Neural animations and modern UX

**Component Architecture**:

```
App.tsx
  ├─ NeuralNavigation (header)
  ├─ AgenticSearchBar (search input with AI suggestions)
  ├─ FilteringSidebar (facets & filters)
  ├─ BentoResultsGrid (results layout)
  │   ├─ ResultCard (individual item)
  │   ├─ ResultCard
  │   └─ ...
  ├─ PerformanceDashboard (analytics)
  └─ KnowledgeGraphBackground (visual effect)
```

**API Integration**:

```typescript
// Search API call
const searchResults = await fetch("/api/search", {
  method: "POST",
  body: JSON.stringify({
    query: "vintage lamp",
    filters: { category: "home_decor", max_price: 500 },
    user_id: "user_alice_456",
  }),
});

// Track interactions
await fetch("/api/events/click", {
  method: "POST",
  body: JSON.stringify({
    user_id: "user_alice_456",
    item_id: "123456",
    position: 1,
    query: "vintage lamp",
  }),
});
```

---

## 🚀 Getting Started

### Prerequisites

- **Docker Desktop** (for local development)
- **Git**
- **uv** (Python package manager) - [Install uv](https://docs.astral.sh/uv/getting-started/installation/)
- **Python 3.13** (for ml-training and search-engine)
- **Python 3.14** (for data-producers, frontend, and infrastructure)
- **Node.js 18+** (for frontend)
- **Java 17+** (for Flink streaming jobs)

### Local Development Setup

#### 1. Clone & Setup Environment

```bash
cd Synapse

# Create virtual environment and install dependencies
uv sync

# Activate the environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

**Python Version Management**:

This monorepo uses multiple Python versions managed by `uv`:

- **Root (`.python-version` = 3.14)**: data-producers, infrastructure, main utilities
- **`ml-training/.python-version` = 3.13**: ML model training with PyTorch
- **`search-engine/.python-version` = 3.13**: Vespa search engine integration

`uv` automatically switches to the correct Python version when you navigate to each directory. To work on a specific component:

```bash
# ML training work (uses Python 3.13)
cd ml-training
uv sync  # Installs dependencies for Python 3.13

# Main services (uses Python 3.14)
cd data-producers/item-lister
uv sync  # Installs dependencies for Python 3.14
```

#### 2. Start the Full Stack (Docker Compose)

```bash
cd infrastructure
docker-compose up -d

# Wait for services to be healthy (2-3 minutes)
docker-compose ps
```

**What starts**:

- Kafka cluster (3 brokers)
- MinIO (S3-compatible storage)
- ClickHouse server
- Vespa container
- Flink JobManager and TaskManagers

#### 3. Initialize Data & Schemas

```bash
python main.py init-db  # Create ClickHouse tables
python main.py init-vespa  # Deploy Vespa schema
```

#### 4. Start the Data Producers

```bash
# Terminal 1: Item Lister API
cd data-producers/item-lister
python app.py

# Terminal 2: Click Tracker API
cd data-producers/click-tracker
python app.py
```

#### 5. Deploy Flink Jobs

```bash
# Terminal 3: Build and submit Flink jobs
cd streaming-jobs
mvn clean package
flink run -m localhost:8081 target/EnqueueItemsJob.jar
flink run -m localhost:8081 target/UserProfileJob.jar
```

#### 6. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

**Frontend will be at**: http://localhost:5173

#### 7. Upload Test Data

```bash
# Use the provided script
python scripts/load_sample_items.py  # Creates 10K test items
```

#### 8. Monitor the System

```bash
# Kafka topics
kafka-topics --bootstrap-server localhost:9092 --list

# ClickHouse queries
clickhouse-client --host localhost

# Flink dashboard
http://localhost:8081

# Vespa status
http://localhost:8080/status.html
```

---

## 📊 Architecture Layers (By Concern)

### Data Layer

- **Object Storage**: MinIO (images, documents)
- **Messaging**: Apache Kafka (event bus)
- **Data Warehouse**: ClickHouse (OLAP, feature store)

### Processing Layer

- **Stream Processing**: Apache Flink (transformations, joins)
- **ML Training**: PyTorch (model training & evaluation)

### Serving Layer

- **Search Engine**: Vespa.ai (indexing & ranking)
- **API Gateway**: FastAPI (request routing, auth)

### Presentation Layer

- **Frontend**: React (TypeScript, Vite)
- **Dashboards**: Analytics (built-in Vespa dashboards, custom React components)

---

## 🔄 Data Flow Summary

```
SELLER ACTION
    ↓
[FastAPI] → MinIO + Kafka
    ↓
[Apache Flink] → Feature Extraction, Joins, Enrichment
    ├─ Write → ClickHouse (analytics & ML training)
    └─ Write → Vespa (search index)
    ↓
[PyTorch] → Train ML Model (daily/weekly)
    ↓
[Vespa] → Deploy ML Model, Re-rank results
    ↓
USER SEARCH
    ↓
[React Frontend] → Query Vespa (50-100ms)
    ↓
[USER INTERACTION] → Clicks, Views, Purchases
    ↓
[FastAPI] → Track Events → Kafka
    ↓
[Flink] → Aggregate User Profiles → ClickHouse
    ↓
[ML Training Loop] → Loop continues...
```

---

## 🏗️ Production Deployment (Kubernetes)

### Prerequisites

- Kubernetes cluster (AWS EKS, Google GKE, or on-premises)
- kubectl configured
- Helm (optional but recommended)

### Deployment Steps

```bash
# 1. Create namespace
kubectl create namespace synapse

# 2. Deploy data platform
kubectl apply -f infrastructure/kubernetes/
  ├─ kafka-deployment.yaml
  ├─ minio-deployment.yaml
  ├─ clickhouse-statefulset.yaml
  ├─ vespa-statefulset.yaml
  └─ flink-deployment.yaml

# 3. Deploy applications
kubectl apply -f infrastructure/kubernetes/api-deployment.yaml
kubectl apply -f infrastructure/kubernetes/frontend-deployment.yaml

# 4. Monitor
kubectl logs -f deployment/item-lister -n synapse
kubectl get pods -n synapse
```

### Auto-Scaling

Configure HPA (Horizontal Pod Autoscaler) for:

- Flink TaskManagers: Scale based on Kafka lag
- API servers: Scale based on CPU/memory
- Vespa: Scale based on search latency

---

## 📈 Performance Metrics to Monitor

### Search Latency (P50, P95, P99)

- Target: <100ms P95
- Monitored via: Vespa metrics, frontend RUM

### Relevance (Click-Through Rate, Conversion Rate)

- Baseline: Compare before/after ML model
- A/B testing recommended for new models

### Data Freshness

- Flink processing latency: end-to-end <5 seconds
- Vespa index update latency: <1 second

### System Health

- Kafka consumer lag: <10s
- ClickHouse query latency: <1s for analytics
- Flink job state size: Monitor for memory leaks

---

## 🛡️ Security Considerations

1. **Data Encryption**:
   - TLS for all network communication (MinIO, Vespa, APIs)
   - Encryption at rest in ClickHouse

2. **Authentication & Authorization**:
   - API key / OAuth 2.0 for external callers
   - RBAC in Kubernetes

3. **Data Privacy**:
   - User data retention policies
   - GDPR compliance (data deletion, anonymization)

4. **Access Control**:
   - Limit Kafka consumer groups to authorized services
   - Firewall rules for databases
   - VPC isolation for sensitive data

---

## 🔧 Troubleshooting

### Flink Job Failing

```bash
# Check logs
kubectl logs <flink-taskmanager-pod> -n synapse

# Check Flink web UI
kubectl port-forward svc/flink-jobmanager 8081:8081 -n synapse
# Navigate to http://localhost:8081
```

### Search Results Not Appearing

```bash
# Check Vespa feed status
curl http://localhost:8080/ApplicationStatus

# Monitor Vespa metrics
curl http://localhost:19092/metrics/v2
```

### High Search Latency

```bash
# Analyze Vespa query traces
curl 'http://localhost:8080/search?query=<query>&trace=5'

# Check ClickHouse slow queries
SELECT * FROM system.query_log WHERE query_duration_ms > 1000
```

---

## 📚 Additional Resources

- [Apache Kafka Documentation](https://kafka.apache.org/documentation/)
- [Apache Flink Documentation](https://flink.apache.org/docs/)
- [Vespa.ai Documentation](https://docs.vespa.ai/)
- [ClickHouse Documentation](https://clickhouse.com/docs)
- [PyTorch Documentation](https://pytorch.org/docs)
- [React Documentation](https://react.dev)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Submit a pull request with detailed description

---

## 📄 License

This project is open-source. See [LICENSE](./LICENSE) file for details.

---

## 📞 Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Contact the maintainers

---

**Built with ❤️ for high-performance, intelligent search experiences.**
