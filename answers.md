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
