# MongoDB Advanced Training Assignment

A comprehensive implementation of schema validation, advanced array queries and updates, bulk write operations, multi-stage aggregation pipelines, compound indexing (ESR), execution plan analysis, disaster recovery, and production architecture using `mongosh`.

## Overview
This repository contains the completed assignment for the **MongoDB (Advanced)** training module (Raja Software Labs). The objective is to demonstrate production-level proficiency in:
- Enforcing server-side document contracts with `$jsonSchema` validation
- Precision array querying and in-place updates using `$elemMatch`, positional `$`, and `arrayFilters`
- High-throughput write batching via `db.collection.bulkWrite()`
- Multi-collection data aggregation and multi-faceted analytics using `$lookup`, `$unwind`, and `$facet`
- Index engineering adhering to the **ESR rule** (Equality, Sort, Range) and query plan diagnostics via `explain("executionStats")`
- Automated document expiration via TTL indexing
- Logical backup creation (`mongodump`) and non-destructive isolated restoration (`mongorestore`) with namespace remapping
- Architectural mastery of MongoDB distributed systems (Replica Sets, Sharding, Consistency, Change Streams, and Security)

## Environment & Prerequisites
- **Database Engine:** MongoDB Community Server (v8.0+ / v6.0+)
- **Shell Interface:** MongoDB Shell (`mongosh` v2.0+)
- **Database Tools:** `mongodump`, `mongorestore` (MongoDB Database Tools)
- **Node.js / JavaScript Runtime:** v18+ (optional, for script execution)

## Repository Structure
```text
mongodb-advanced-assignment-sanketahire/
├── .gitignore                         # Ignored operating system, log, and archive artifacts
├── README.md                          # Project documentation, execution logs, and verification
├── mongodb-advanced-assignment.js     # Primary solution script for Tasks 1–5 (pure queries)
├── backup-restore-commands.txt        # Command-line execution instructions for Task 6
├── answers.md                         # Task 5.2 explain statistics and Task 7 MCQ assessments
├── screenshots/                       # Visual proof of successful execution
└── docs/                              # Assignment specifications and reference materials
    ├── Training.Assignment.Mongdb (Advance).pdf
    └── Training.Material.Mongdb (Advance).pdf
```

## Solution Delivery
The full assignment solution, queries, outputs, and visual execution artifacts are implemented in the `feature/mongodb-advanced-assignment` branch and submitted via Pull Request.

## How to Run the Solution Script

You can execute the entire assignment script [`mongodb-advanced-assignment.js`](mongodb-advanced-assignment.js) directly against your local MongoDB instance using any of the following methods:

### Method 1: Input Redirection via Terminal (Recommended)
Because the script begins with `use company_advanced;`, redirecting the file directly into `mongosh` executes all tasks sequentially while echoing both the queries and formatted terminal outputs:

```bash
# Navigate to the repository directory
cd /path/to/mongodb-advanced-assignment-sanketahire

# Execute via standard input redirection
mongosh < mongodb-advanced-assignment.js
```

### Method 2: Pass Script Directly to `mongosh`
Run the script as an argument to `mongosh`:

```bash
# Execute against the company_advanced database
mongosh company_advanced mongodb-advanced-assignment.js
```

*Or with an explicit connection string:*
```bash
mongosh "mongodb://127.0.0.1:27017/company_advanced" mongodb-advanced-assignment.js
```

### Method 3: Execute from within `mongosh` Shell
If you already have an active `mongosh` session:

```javascript
// 1. Switch to the company_advanced database
use company_advanced;

// 2. Load and run the script file
load("mongodb-advanced-assignment.js");
```

### Method 4: Interactive Step-by-Step Execution
Open the MongoDB Shell (`mongosh`) and execute the individual query blocks step-by-step as documented in the task-by-task sections below.

---

*(Task-by-task implementation, terminal outputs, and screenshot verifications will be added sequentially across feature branch phases).*
