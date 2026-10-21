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

## Task-by-Task Implementation & Verification

### Task 1: Schema Validation and Data Creation

#### Step 1: Select Database & Clean Slate Reset
Switch to the fresh `company_advanced` database and ensure a clean slate.

⚡ **Input Command:**
```javascript
use company_advanced;
db.employees.drop();
```
🖥️ **Terminal Output:**
```text
switched to db company_advanced
true
```

#### Step 2: Create the Validated Collection with `$jsonSchema`
Create the `employees` collection with strict schema validation enforcing:
- `name`: string
- `departmentId`: int
- `experience`: int
- `active`: bool

⚡ **Input Command:**
```javascript
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "departmentId", "experience", "active"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        departmentId: {
          bsonType: "int",
          description: "must be an integer and is required"
        },
        experience: {
          bsonType: "int",
          description: "must be an integer and is required"
        },
        active: {
          bsonType: "bool",
          description: "must be a boolean and is required"
        }
      }
    }
  }
});
```
🖥️ **Terminal Output:**
```json
{
  "ok": 1
}
```

#### Step 3: Insert the Starting Dataset
Insert the three baseline employee documents (John, Alice, David) using `NumberInt()` for integer fields.

⚡ **Input Command:**
```javascript
db.employees.insertMany([
  {
    _id: 1,
    name: "John",
    departmentId: NumberInt(10),
    skills: ["Java", "MongoDB"],
    experience: NumberInt(4),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Expired", expiryYear: NumberInt(2026) }
    ]
  },
  {
    _id: 2,
    name: "Alice",
    departmentId: NumberInt(10),
    skills: ["Python", "MongoDB"],
    experience: NumberInt(6),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Active", expiryYear: NumberInt(2028) }
    ]
  },
  {
    _id: 3,
    name: "David",
    departmentId: NumberInt(20),
    skills: ["Communication"],
    experience: NumberInt(3),
    active: false,
    certifications: [
      { name: "Communication", status: "Active", expiryYear: NumberInt(2027) }
    ]
  }
]);
```
🖥️ **Terminal Output:**
```json
{
  "acknowledged": true,
  "insertedIds": {
    "0": 1,
    "1": 2,
    "2": 3
  }
}
```

#### Step 4: Test Schema Validation with Invalid Document
Attempt to insert an invalid document (`_id: 99`) containing mismatched types (`name` as integer, `departmentId` as string `"HR"`, `experience` as string `"one"`, `active` as string `"yes"`).

⚡ **Input Command:**
```javascript
db.employees.insertOne({
  _id: 99,
  name: 123,
  departmentId: "HR",
  experience: "one",
  active: "yes"
});
```
🖥️ **Terminal Output:**
```text
MongoServerError: Document failed validation
Additional information: {
  failingDocumentId: 99,
  details: {
    operatorName: '$jsonSchema',
    schemaRulesNotSatisfied: [
      {
        operatorName: 'properties',
        propertiesNotSatisfied: [
          { propertyName: 'name', reason: 'type did not match', consideredValue: 123, consideredType: 'int' },
          { propertyName: 'departmentId', reason: 'type did not match', consideredValue: 'HR', consideredType: 'string' },
          { propertyName: 'experience', reason: 'type did not match', consideredValue: 'one', consideredType: 'string' },
          { propertyName: 'active', reason: 'type did not match', consideredValue: 'yes', consideredType: 'string' }
        ]
      }
    ]
  }
}
```

#### Step 5: Verify Collection Document Count
Confirm that the collection contains strictly the 3 valid documents.

⚡ **Input Command:**
```javascript
db.employees.countDocuments();
```
🖥️ **Terminal Output:**
```text
3
```

#### Visual Execution Proof:
* **Setup, Collection Creation & Seed Insertion:**  
  ![Task 1 Setup & Seed](screenshots/01a_setup_and_seed.png)
* **Schema Validation Failure (Negative Test):**  
  ![Task 1 Validation Rejection](screenshots/01b_validation_failure.png)
* **Validation Details & Document Count Verification:**  
  ![Task 1 Count Verification](screenshots/01c_count_verification.png)

