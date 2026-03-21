# Models

ONNX models deployed to Vespa for ranking and embedding.

## Files

- `ranking.onnx` — LightGBM ranking model, trained in `ml-training/`, exported to ONNX
- `embeddings.onnx` — Sentence transformer embedding model for vector search

## Updating Models

1. Train a new model in `ml-training/`:
```bash
   cd ml-training
   python train_ranking.py
```
2. Copy the output to this directory:
```bash
   cp ml-training/models/ranking.onnx search-engine/models/
```
3. Redeploy Vespa to pick up the new model.

## Note

The `.onnx` files are gitignored due to their size.
Use the training pipeline to regenerate them locally.