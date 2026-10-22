# MongoDB Advanced Assessment Answers

## Task 5.2: Recorded Query Execution Statistics (`explain("executionStats")`)

**Target Query:**
```javascript
db.employees.find({ departmentId: 10 }).sort({ name: 1 }).explain("executionStats");
```

🖥️ **Terminal Output (`explain("executionStats")`):**
```json
{
  "explainVersion": "1",
  "queryPlanner": {
    "namespace": "company_advanced.employees",
    "parsedQuery": {
      "departmentId": {
        "$eq": 10
      }
    },
    "indexFilterSet": false,
    "winningPlan": {
      "stage": "FETCH",
      "inputStage": {
        "stage": "IXSCAN",
        "keyPattern": {
          "departmentId": 1,
          "name": 1
        },
        "indexName": "departmentId_1_name_1",
        "isMultiKey": false,
        "direction": "forward",
        "indexBounds": {
          "departmentId": [
            "[10, 10]"
          ],
          "name": [
            "[MinKey, MaxKey]"
          ]
        }
      }
    }
  },
  "executionStats": {
    "executionSuccess": true,
    "nReturned": 2,
    "executionTimeMillis": 0,
    "totalKeysExamined": 2,
    "totalDocsExamined": 2,
    "executionStages": {
      "stage": "FETCH",
      "nReturned": 2,
      "executionTimeMillisEstimate": 0,
      "docsExamined": 2,
      "inputStage": {
        "stage": "IXSCAN",
        "nReturned": 2,
        "executionTimeMillisEstimate": 0,
        "keyPattern": {
          "departmentId": 1,
          "name": 1
        },
        "indexName": "departmentId_1_name_1",
        "direction": "forward",
        "keysExamined": 2,
        "seeks": 1
      }
    }
  }
}
```

**Index Used:** `departmentId_1_name_1` on `{ departmentId: 1, name: 1 }`

| Metric | Recorded Machine Value | Technical Interpretation |
| :--- | :---: | :--- |
| **winning plan stage** | **`IXSCAN`** | MongoDB used the compound index `departmentId_1_name_1` (executed as an `IXSCAN` input stage under `FETCH`) rather than scanning collection documents via `COLLSCAN`. |
| **`nReturned`** | **`2`** | Total matching documents returned (Alice and John belong to `departmentId: 10`). |
| **`totalDocsExamined`** | **`2`** | Number of collection documents inspected. Matches `nReturned` exactly ($2:2$), confirming zero extraneous document reads. |
| **`totalKeysExamined`** | **`2`** | Number of B-tree index entries scanned. Matches `nReturned` exactly ($2:2$), confirming optimal index selectivity. |

### Architectural Analysis:
The index `{ departmentId: 1, name: 1 }` strictly adheres to the **ESR Rule** (Equality $\rightarrow$ Sort $\rightarrow$ Range):
1. **Equality (`departmentId: 10`):** Narrows the search range to index entries for department 10.
2. **Sort (`name: 1`):** Traverses the index in alphabetical order, completely eliminating the need for an in-memory blocking sort (`SORT` stage).
3. The resulting metric ratio $\text{totalKeysExamined} : \text{totalDocsExamined} : \text{nReturned} = 2 : 2 : 2$ demonstrates optimal $O(\log N)$ index performance with zero wasted I/O.

---

## Task 7: MongoDB Advanced Concepts — MCQs

### Executive Summary: Quick-Reference Answer Key

| Question # | Core Topic Area | Correct Answer | Key Concept Summary |
| :---: | :--- | :---: | :--- |
| **Q1** | Schema Validation | **B** | Enforces data integrity by rejecting documents violating field types/schemas. |
| **Q2** | Array Query Operators (`$elemMatch`) | **B** | Ensures multiple query criteria match against the *same* embedded array object. |
| **Q3** | Filtered Array Updates (`arrayFilters`) | **C** | Selectively updates array elements that satisfy specific conditional criteria. |
| **Q4** | Bulk Operations (`bulkWrite`) | **A** | Combines multiple write operations into a single round-trip network payload. |
| **Q5** | Aggregation Pipeline Stages (`$lookup`) | **C** | Performs left outer joins to pull related documents from another collection. |
| **Q6** | Execution Plan Diagnostics (`IXSCAN`) | **B** | Indicates the query planner leveraged an index B-tree rather than a `COLLSCAN`. |
| **Q7** | Multi-Document Transactions (`abortTransaction`) | **C** | Aborts transactional batch and rolls back uncommitted writes atomically. |
| **Q8** | Replica Set Durability (`w: "majority"`) | **B** | Guarantees write acknowledgement across majority of voting data-bearing members. |
| **Q9** | High Availability & Failover | **C** | Eligible replica set secondaries automatically elect a new Primary node. |
| **Q10** | Sharding Strategy (Shard Key) | **B** | Requires high cardinality and uniform distribution to prevent jumbo chunks and hotspots. |
| **Q11** | Real-Time Events (Change Streams) | **A** | Applications listen in real time to database mutations (inserts, updates, deletes) via oplog. |
| **Q12** | Production Security Hardening | **C** | Hardens database using TLS encryption, restricted network access, and least privilege. |

---

### Detailed Question-by-Question Breakdown & Technical Justifications

#### Q1. Why is schema validation useful?
- A. It automatically creates backups.
- **B. It rejects documents that do not follow required fields or data types.**
- C. It distributes data across shards.
- D. It creates indexes for every field.

> **Selected Answer:** **B. It rejects documents that do not follow required fields or data types.**  
> **Technical Justification:**  
> MongoDB provides flexible, dynamic schemas by default, but production applications require strict structural consistency. `$jsonSchema` validation rules configured via `createCollection` or `collMod` enforce field presence, strict BSON types (e.g., `string`, `int`, `bool`), and value constraints at the database level. When an insertion or update violates these constraints (as demonstrated in Task 1 with document `_id: 99`), MongoDB immediately aborts the operation with a `DocumentValidationFailure` error, preventing corrupted or malformed data from entering the database.

---

#### Q2. What does $elemMatch help verify?
- A. Conditions match different documents.
- **B. Multiple conditions match the same array object.**
- C. Every array element is updated.
- D. A collection exists.

> **Selected Answer:** **B. Multiple conditions match the same array object.**  
> **Technical Justification:**  
> In standard multikey querying across embedded document arrays, independent filter conditions can match across different array elements within the same parent document (e.g., one element has `name: "MongoDB"` and another element in the same array has `status: "Active"`). The `$elemMatch` operator mandates that **all** specified conditions are fulfilled concurrently by a **single, discrete array subdocument** (as demonstrated in Task 2.1).

---

#### Q3. What is the purpose of arrayFilters?
- A. To sort an array.
- B. To delete a collection.
- **C. To update selected array elements that match a condition.**
- D. To create a replica set.

> **Selected Answer:** **C. To update selected array elements that match a condition.**  
> **Technical Justification:**  
> Traditional positional operators like `$` only update the *first* matching array element encountered during query evaluation. The `arrayFilters` option in `updateOne()` / `updateMany()` allows developers to define named filter identifiers (e.g., `$[c]`) with conditional predicates, enabling precise, in-place bulk updates to **all** embedded array elements that satisfy the filter condition (as demonstrated in Task 2.3 for all certifications where `expiryYear < 2027`).

---

#### Q4. When is bulkWrite() useful?
- **A. When several write operations should be sent together.**
- B. Only when reading data.
- C. Only when creating indexes.
- D. When configuring sharding.

> **Selected Answer:** **A. When several write operations should be sent together.**  
> **Technical Justification:**  
> `db.collection.bulkWrite()` allows applications to batch multiple distinct, heterogeneous write operations (`insertOne`, `updateOne`, `updateMany`, `deleteOne`, `deleteMany`, `replaceOne`) into a single network round-trip. This dramatically reduces network latency, connection pool overhead, and socket context switching compared to dispatching consecutive individual write commands (as demonstrated in Task 3).

---

#### Q5. Which stage joins documents from another collection?
- A. $group
- B. $facet
- **C. $lookup**
- D. $count

> **Selected Answer:** **C. $lookup**  
> **Technical Justification:**  
> The `$lookup` aggregation pipeline stage performs a left outer join with another uncorrelated collection in the same database. By matching a local field (e.g., `employees.departmentId`) against a foreign field (e.g., `departments._id`), `$lookup` populates a new array attribute containing all matching parent/foreign records, which can then be deconstructed using `$unwind` (as demonstrated in Task 4.1).

---

#### Q6. What does IXSCAN usually indicate in explain() output?
- A. MongoDB scanned every document without an index.
- **B. MongoDB used an index.**
- C. MongoDB restored a backup.
- D. MongoDB started a transaction.

> **Selected Answer:** **B. MongoDB used an index.**  
> **Technical Justification:**  
> In MongoDB query execution plans (`explain()`), `IXSCAN` indicates that the query planner traversed an index B-tree structure (`inputStage.stage: "IXSCAN"`) rather than performing an unindexed full collection scan (`COLLSCAN`). When paired with a `FETCH` stage or executed as a covered query, `IXSCAN` demonstrates optimal read path performance and efficient key selectivity (as recorded on our machine in Task 5.2).

---

#### Q7. What happens when abortTransaction() is called?
- A. All transaction changes are committed.
- B. Only the last operation is kept.
- **C. Uncommitted transaction changes are rolled back.**
- D. The database is deleted.

> **Selected Answer:** **C. Uncommitted transaction changes are rolled back.**  
> **Technical Justification:**  
> In multi-document ACID transactions, invoking `session.abortTransaction()` discards all pending insert, update, and delete mutations executed within the active session boundaries. The WiredTiger storage engine releases document and collection locks and ensures no uncommitted transaction writes are persisted to the replica set oplog or database storage engine files.

---

#### Q8. What does write concern w: "majority" mean?
- A. Only the client confirms the write.
- **B. A majority of voting data-bearing replica-set members acknowledge the write.**
- C. Every read goes to a secondary.
- D. The write is sent to every shard.

> **Selected Answer:** **B. A majority of voting data-bearing replica-set members acknowledge the write.**  
> **Technical Justification:**  
> A write concern of `w: "majority"` instructs the Primary node to defer sending a write acknowledgement to the client until the mutation has been written to the on-disk journal / memory and successfully replicated to a calculated majority of voting, data-bearing members in the replica set (e.g., at least 2 out of 3 nodes). This protects against dirty writes and rollbacks in the event of an unexpected Primary node crash or network partition.

---

#### Q9. What normally happens when a replica-set Primary fails?
- A. The complete database is deleted.
- B. The application must manually copy all data.
- **C. Eligible members hold an election for a new Primary.**
- D. Every Secondary becomes Primary.

> **Selected Answer:** **C. Eligible members hold an election for a new Primary.**  
> **Technical Justification:**  
> MongoDB replica sets utilize automated consensus-based failover. When heartbeat signals from the Primary cease for longer than the configured election timeout (default 10 seconds), eligible data-bearing Secondary members initiate an election. The candidate node with the highest priority and the most up-to-date replication oplog position that receives a majority of cluster votes is promoted to the new Primary without human intervention.

---

#### Q10. Which is the best direction for choosing a shard key?
- A. A field with only two possible values.
- **B. A high-cardinality field that distributes traffic and matches common queries.**
- C. Any field used only for display.
- D. A field that sends every new write to one shard.

> **Selected Answer:** **B. A high-cardinality field that distributes traffic and matches common queries.**  
> **Technical Justification:**  
> An effective shard key requires **high cardinality** (a large universe of distinct values) to enable fine-grained chunk splitting, **even write distribution** (non-monotonic) to avoid single-shard insertion hotspots, and **query isolation** (aligning with application read predicates) so the `mongos` router can target queries directly to specific shards rather than broadcasting expensive scatter-gather operations across all cluster shards.

---

#### Q11. What do Change Streams allow an application to do?
- **A. Listen for inserts, updates, replacements, and deletes.**
- B. Encrypt every field automatically.
- C. Create a backup without mongodump.
- D. Replace indexes with transactions.

> **Selected Answer:** **A. Listen for inserts, updates, replacements, and deletes.**  
> **Technical Justification:**  
> Change Streams (`db.collection.watch()`) tail the replica set oplog to emit real-time, filtered notification events for collection-level mutations (`insert`, `update`, `replace`, `delete`, `drop`). Each event payload includes an opaque `_id` resume token, enabling applications to persist state and resume listening seamlessly after server restarts or network interruptions without missing data modifications.

---

#### Q12. Which is a good production-security practice?
- A. Use an administrative user for the application.
- B. Put the database password in source code.
- **C. Use TLS, restricted network access, and least-privilege credentials.**
- D. Allow connections from every network.

> **Selected Answer:** **C. Use TLS, restricted network access, and least-privilege credentials.**  
> **Technical Justification:**  
> Production database security requires defense-in-depth:
> 1. **TLS/SSL Encryption:** Secures network traffic in transit against interception and tampering.
> 2. **Network Isolation:** Firewalls, VPC peering, and IP allowlisting prevent unauthorized ingress.
> 3. **Role-Based Access Control (RBAC) & Least Privilege:** Application connection strings should use dedicated, least-privileged credentials (e.g., `readWrite` scoped strictly to target databases) rather than administrative roles (`root`, `clusterAdmin`), minimizing blast radius in the event of credential compromise.
