# FIND-BACK AI System Architecture

## Overview Diagram

```
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|                                                                                   |
|  +--------------------+   +----------------------+   +-------------------------+  |
|  | Police Command Ctr |   | NGO / Shelter Intake |   |  AI Voice / Text Agent  |  |
|  | - Map & Risk Heat  |   | - Photo Intake       |   | - Natural Language Bar  |  |
|  | - Match Verification|   | - Auto-Match Feedback|   | - Web Speech API        |  |
|  +---------+----------+   +----------+-----------+   +------------+------------+  |
+------------|-------------------------|----------------------------|---------------+
             |                         |                            |
             +-------------------------+----------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------------+
|                                 FASTAPI BACKEND                                   |
|                                                                                   |
|  +---------------------+   +-------------------------+   +---------------------+  |
|  |  Agent Orchestrator |   | Multi-Modal Matcher     |   | Geospatial Engine   |  |
|  | - Intent Extraction |   | - Image Embedding (Res) |   | - Red/Orange/Green  |  |
|  | - Tool Registry     |   | - Hybrid Score Formula  |   |   Density Risk Zone |  |
|  | - Fallback Parser   |   |   (Visual+Age+Geo+Time) |   | - Map Coordinates   |  |
|  +----------+----------+   +------------+------------+   +----------+----------+  |
|             |                           |                           |             |
|             +---------------------------+---------------------------+             |
|                                         |                                         |
|                                         v                                         |
|                        SQLAlchemy ORM + SQLite Database                           |
|       (Users, MissingPersons, UnidentifiedPersons, Embeddings, Matches, Logs)     |
+-----------------------------------------------------------------------------------+
```

## Data Flow & Matching Pipeline

1. **Intake & Vector Embedding**:
   - When Police register a missing person or an NGO uploads an unidentified found person, the photograph is passed through `feature_extractor.py`.
   - A normalized 128-dimensional multi-scale spatial & color feature vector is calculated and indexed into `image_embeddings`.

2. **Multi-Signal Hybrid Score Calculation**:
   $$\text{Score} = w_v \cdot \text{Sim}_{\text{visual}} + w_a \cdot \text{Sim}_{\text{age}} + w_g \cdot \text{Sim}_{\text{geo}} + w_t \cdot \text{Sim}_{\text{time}}$$
   - Weights dynamically adjust if optional metadata (like age or exact location) is missing.

3. **Autonomous Agent Tool Calling**:
   - The user inputs natural language queries via typed text or Speech Recognition (`"Show missing children between 8 and 15 in Vijayawada"`).
   - The Agent Orchestrator parses parameters, executes database tools (`tool_search_missing_cases`, `tool_get_area_statistics`), updates map center/zoom, updates stats, and generates natural language explanations.

4. **Human-in-the-Loop Verification**:
   - Matches above threshold are created as `PENDING_VERIFICATION` candidate pairs.
   - Authorized Police users review candidate pairs side-by-side and explicitly mark `VERIFIED_MATCH` or `REJECTED`.
