// Auto-generated from references/*.jsx — structured "extras" (complexity tables,
// pros/cons, failure modes, cloud mappings, code examples, etc.) rendered on each
// per-concept page below the key points. Keyed by "topicId:conceptName".

export type ExtraSection =
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "deflist"; heading: string; items: { term: string; body: string }[] }
  | { kind: "table"; heading: string; cols: string[]; rows: string[][] }
  | { kind: "code"; heading: string; code: string }
  | { kind: "prose"; heading: string; text: string };

export type ConceptExtras = { sections: ExtraSection[] };

export const conceptExtras: Record<string, ConceptExtras> = {
  "data-structures-algorithms:Asymptotic Analysis": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Growth class",
          "Big-Θ",
          "Steps @ n = 10⁶"
        ],
        "rows": [
          [
            "Constant",
            "Θ(1)",
            "1"
          ],
          [
            "Logarithmic",
            "Θ(log n)",
            "~20"
          ],
          [
            "Linear",
            "Θ(n)",
            "10⁶"
          ],
          [
            "Linearithmic",
            "Θ(n log n)",
            "~2 × 10⁷"
          ],
          [
            "Quadratic",
            "Θ(n²)",
            "10¹²"
          ],
          [
            "Exponential",
            "Θ(2ⁿ)",
            "astronomical"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Asymptotics at small n",
            "body": "You pick the 'faster' big-O algorithm and it loses in practice. The dropped constants and lower-order terms dominate at small/medium `n`, so a `Θ(n²)` with a tiny constant beats a `Θ(n log n)` with a big one. Benchmark at your real input sizes — this is exactly why std-library sorts switch to insertion sort below ~16 elements."
          },
          {
            "term": "The hidden worst case",
            "body": "Average-case `Θ(n log n)` code occasionally hangs. A worst-case input (sorted data into a naive-pivot quicksort, or adversarial keys into a hash table) pushes it to `Θ(n²)` or worse. Randomize pivots / use median-of-three, or pick an algorithm with a hard worst-case bound."
          },
          {
            "term": "Confusing O with Θ",
            "body": "You 'prove' an algorithm is fast by citing a loose `O()` upper bound. `O` is only an upper bound, so saying an `O(n)` routine is `O(n²)` is technically true and useless. State `Θ` when you mean a tight bound, and remember an upper bound alone says nothing about the lower bound."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:The Machine Model": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Tier",
          "Typical latency",
          "Relative cost"
        ],
        "rows": [
          [
            "Register",
            "~0.3 ns",
            "1×"
          ],
          [
            "L1 cache",
            "~1 ns",
            "~3×"
          ],
          [
            "L2 cache",
            "~4 ns",
            "~13×"
          ],
          [
            "L3 cache",
            "~12 ns",
            "~40×"
          ],
          [
            "Main RAM",
            "~80 ns",
            "~250×"
          ],
          [
            "SSD read",
            "~100 µs",
            "~300,000×"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Pointer-chasing structures",
            "body": "A linked list or pointer-heavy tree is slow despite a great Big-O. Every node is a separate heap allocation at a random address, so traversal is a stream of cache misses with nothing prefetched. Use contiguous layouts — arrays, array-backed heaps, struct-of-arrays — or a pool allocator so nodes sit next to each other."
          },
          {
            "term": "Array-of-structs scans",
            "body": "You loop over one field across many objects and it crawls. With interleaved fields, each 64-byte line you load carries mostly the *other* fields you didn't want. Switch to struct-of-arrays (each field its own array) so the field you scan is contiguous and every loaded byte is useful."
          },
          {
            "term": "False sharing",
            "body": "A multithreaded counter gets *slower* as you add threads. Two cores write different variables that happen to share one cache line, forcing the line to bounce between caches on every write. Pad hot per-thread data so each lands on its own 64-byte line."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Arrays & Dynamic Arrays": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Space"
        ],
        "rows": [
          [
            "Index / set a[i]",
            "Θ(1)",
            "—"
          ],
          [
            "append (amortized)",
            "Θ(1)*",
            "Θ(1)"
          ],
          [
            "append (single worst)",
            "Θ(n)",
            "Θ(n)"
          ],
          [
            "insert / delete at i",
            "Θ(n)",
            "—"
          ],
          [
            "search (unsorted)",
            "Θ(n)",
            "—"
          ],
          [
            "total storage",
            "—",
            "Θ(n)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Front insert/delete in a loop",
            "body": "A loop doing `lst.pop(0)` or `lst.insert(0, x)` quietly becomes `O(n²)` — each call shifts every remaining element by one slot. Use `collections.deque` for true `O(1)` ends, or append to the back and reverse once at the end."
          },
          {
            "term": "Amortized is not worst-case latency",
            "body": "An average `O(1)` append still has occasional `O(n)` spikes when a resize fires — fatal for a real-time or audio loop where one frame must not stall on a giant copy + allocation. Preallocate to the known size up front (`reserve` / build a fixed list), or use a chunked deque that never relocates."
          },
          {
            "term": "Capacity never auto-shrinks",
            "body": "After growing to a million and deleting almost everything, most implementations keep the huge buffer — your memory stays pinned high. Rebuild the container (`lst = list(lst)`) or call the language's `shrink_to_fit` to release the slack."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Linked Lists": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Space"
        ],
        "rows": [
          [
            "Index / search",
            "Θ(n)",
            "—"
          ],
          [
            "Insert/delete at head",
            "Θ(1)",
            "Θ(1)"
          ],
          [
            "Splice given node ref",
            "Θ(1)",
            "Θ(1)"
          ],
          [
            "Delete held node (singly)",
            "Θ(n)",
            "—"
          ],
          [
            "Insert/delete at index i",
            "Θ(n)",
            "—"
          ],
          [
            "Storage (n nodes)",
            "—",
            "Θ(n) + ptrs"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Indexing it like an array",
            "body": "Writing `node_at(k)` and calling it inside a loop turns an innocent traversal into `O(n²)` — each lookup re-walks from the head. Iterate with a moving cursor (`while node: node = node.next`), or pick an array if you truly need random access."
          },
          {
            "term": "Cache misses eat the asymptotics",
            "body": "For read- or scan-heavy workloads a linked list is routinely 5–10× slower than an array of the same `O(n)`, because every node is a random-address pointer chase that stalls on memory. Use contiguous storage, or pool the nodes in one slab so they sit near each other."
          },
          {
            "term": "Singly-linked delete needs the predecessor",
            "body": "You hold the node to remove but it is singly linked, so unlinking it is `O(n)` — you must scan from the head to find the node whose `next` points at it. Use a doubly linked list, keep a `prev` handle, or copy the successor's value into this node and delete the successor instead."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Stacks, Queues, Deques & Ring Buffers": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Space"
        ],
        "rows": [
          [
            "Stack push / pop",
            "Θ(1)",
            "Θ(1)"
          ],
          [
            "Queue enqueue/dequeue (ring)",
            "Θ(1)",
            "Θ(1)"
          ],
          [
            "Queue dequeue (array front)",
            "Θ(n)",
            "—"
          ],
          [
            "Deque push/pop either end",
            "Θ(1)",
            "Θ(1)"
          ],
          [
            "Peek front / top",
            "Θ(1)",
            "—"
          ],
          [
            "Storage",
            "—",
            "Θ(n)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "The list-as-queue mistake",
            "body": "Using a plain list and calling `lst.pop(0)` to dequeue is `O(n)` per call and `O(n²)` to drain — every survivor shifts down a slot. Use `collections.deque` (a doubly linked block list) or a ring buffer for `O(1)` ends."
          },
          {
            "term": "Full vs empty ambiguity",
            "body": "A ring buffer with only `head` and `tail` cannot distinguish full from empty: both leave `head == tail`, so a wrong guess either drops data or reads stale slots. Track an explicit element count, or deliberately keep one slot vacant so 'full' means `(tail + 1) % cap == head`."
          },
          {
            "term": "Overflow with no policy",
            "body": "When the producer outruns the consumer, a fixed ring overflows — and silently overwriting unread data corrupts the stream. Decide the policy on purpose: block the producer, drop the oldest, or drop the newest; do not let it happen by accident."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Hash Functions & Hash Tables": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Average",
          "Worst case"
        ],
        "rows": [
          [
            "Lookup",
            "Θ(1)",
            "Θ(n)"
          ],
          [
            "Insert (amortized)",
            "Θ(1)",
            "Θ(n)"
          ],
          [
            "Delete",
            "Θ(1)",
            "Θ(n)"
          ],
          [
            "Resize / rehash",
            "Θ(n) total",
            "Θ(n)"
          ],
          [
            "Iterate all keys",
            "Θ(n)",
            "Θ(n)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Hash flooding (algorithmic DoS)",
            "body": "An attacker who knows your hash function sends keys engineered to all collide, collapsing every `O(1)` op to `O(n)` and freezing the server. Use a keyed, randomized hash like SipHash (Python, Rust, and Perl seed string hashing per-process for exactly this reason)."
          },
          {
            "term": "A weak or low-entropy hash",
            "body": "Hashing on only the low bits, or `% ` a non-prime against patterned keys (multiples of 16, sequential IDs), clusters everything into a few buckets and wrecks the distribution. Use a proper mixing/finalizer step and a prime modulus, and never use an object's memory address as the hash of a value-equality key."
          },
          {
            "term": "Mutating a key in place",
            "body": "Change a field the hash depends on after inserting, and the entry is now in the wrong bucket — present in memory but unfindable, since lookups compute the *new* hash. Only hash on immutable fields, and never mutate a key while it lives in a set or dict."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Collision Resolution": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Chaining",
          "Open addressing"
        ],
        "rows": [
          [
            "Lookup (average)",
            "Θ(1 + α)",
            "Θ(1 / (1 − α))"
          ],
          [
            "Insert (average)",
            "Θ(1)",
            "Θ(1 / (1 − α))"
          ],
          [
            "Delete",
            "Θ(1)",
            "Θ(1) + tombstone"
          ],
          [
            "Worst case",
            "Θ(n)",
            "Θ(n)"
          ],
          [
            "Per-entry overhead",
            "list node",
            "none (in-array)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Deleting without a tombstone",
            "body": "In open addressing, blanking a deleted slot severs the probe chain: every entry that was bumped past it becomes unreachable even though it is still in the array. Mark deletions as tombstones that lookups skip and inserts may overwrite, and periodically rehash the whole table to purge accumulated tombstones."
          },
          {
            "term": "Primary clustering at high load",
            "body": "Linear probing lets occupied runs merge into ever-longer ones, so probe sequences lengthen and lookups crawl as `α` approaches 0.9. Hold `α` under ~0.7 with timely resizes, or switch to double hashing / Robin Hood hashing, which spread the probes out."
          },
          {
            "term": "One giant chain from a bad hash",
            "body": "With chaining and a poor hash, most keys funnel into a few buckets, so a 'list' becomes a linear scan plus a stream of cache misses on every node. Fix the hash, and treeify pathologically long chains — Java's HashMap rewrites any chain over length 8 as a red-black tree for an `O(log k)` floor."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Binary Trees & Traversals": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Space"
        ],
        "rows": [
          [
            "Pre / in / post-order",
            "Θ(n)",
            "Θ(h)"
          ],
          [
            "Level-order (BFS)",
            "Θ(n)",
            "Θ(w)"
          ],
          [
            "Search (unordered tree)",
            "Θ(n)",
            "Θ(h)"
          ],
          [
            "Recursion stack depth",
            "—",
            "Θ(h)"
          ],
          [
            "Node storage",
            "—",
            "Θ(n)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Deep recursion overflows the stack",
            "body": "A skewed tree of height `n` recursed naively hits a `RecursionError` (Python caps at ~1000 frames) or a native stack overflow. Traverse iteratively with an explicit stack/queue, or keep the tree balanced so `h = O(log n)`."
          },
          {
            "term": "Assuming O(log n) on an unbalanced tree",
            "body": "Tree operations are only logarithmic when the height is logarithmic; a tree built from sorted insertions degrades to a chain with `O(n)` height and `O(n)` operations. Use a self-balancing tree (next chapters) or randomize insertion order."
          },
          {
            "term": "Picking the wrong traversal",
            "body": "Expecting sorted output from preorder, or trying to free/evaluate a tree top-down, produces wrong results — only inorder sorts a BST, and only postorder safely deletes children before parents. Match the order to the task, and never mutate the tree mid-walk without a snapshot."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Binary Search Trees": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Balanced",
          "Worst case"
        ],
        "rows": [
          [
            "Search",
            "Θ(log n)",
            "Θ(h)"
          ],
          [
            "Insert",
            "Θ(log n)",
            "Θ(h)"
          ],
          [
            "Delete",
            "Θ(log n)",
            "Θ(h)"
          ],
          [
            "Min / max / successor",
            "Θ(log n)",
            "Θ(h)"
          ],
          [
            "Inorder (sorted output)",
            "Θ(n)",
            "Θ(h)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Sorted or monotonic insertion",
            "body": "Building a BST from sorted data, or from ever-increasing keys like timestamps and auto-increment IDs, produces a fully one-sided chain of height `n` — every operation becomes `O(n)`. Use a self-balancing tree, shuffle the inputs first, or pick a structure with hard worst-case bounds."
          },
          {
            "term": "Deleting a two-child node naively",
            "body": "Just detaching a node that has both children orphans a whole subtree or violates the ordering. Replace the node's key with its inorder successor (the minimum of the right subtree), then delete that successor, which is guaranteed to have at most one child."
          },
          {
            "term": "Undefined duplicate-key policy",
            "body": "Without a rule for equal keys you get lost updates, keys scattered inconsistently across both subtrees, or even loops. Decide up front — store a count on the node, always send equals one direction, or forbid duplicates — and apply it everywhere."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Self-Balancing Trees": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Property",
          "AVL",
          "Red-Black"
        ],
        "rows": [
          [
            "Search / insert / delete",
            "Θ(log n)",
            "Θ(log n)"
          ],
          [
            "Height bound",
            "≤ 1.44 log n",
            "≤ 2 log n"
          ],
          [
            "Rotations per insert",
            "≤ 2",
            "≤ 2"
          ],
          [
            "Rotations per delete",
            "O(log n)",
            "≤ 3"
          ],
          [
            "Best-fit workload",
            "read-heavy",
            "write-heavy"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Rebalancing only the new node",
            "body": "An imbalance created by an insert or delete can surface several levels *above* the touched node, so checking just that node leaves a hidden violation. Retrace the path to the root, updating heights (AVL) or running the recolor/rotate fix-up loop (red-black) the whole way up."
          },
          {
            "term": "Mis-wiring the re-homed subtree",
            "body": "The single most common rotation bug is mishandling the middle subtree (`T2` above) — drop it and you lose nodes; attach it on the wrong side and you break the ordering. Follow the three-pointer dance exactly, and verify with property checks: inorder must stay sorted and the invariant must hold."
          },
          {
            "term": "AVL on a write-heavy workload",
            "body": "AVL's strict balance triggers more restructuring under churny inserts and deletes, so using it where writes dominate burns cycles for balance you do not read back. Prefer a red-black tree (fewer rotations per update) for write-heavy maps; reserve AVL for lookup-dominated data."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:B-Trees & B+ Trees": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Comparisons",
          "Disk page reads"
        ],
        "rows": [
          [
            "Search",
            "Θ(log n)",
            "Θ(log_m n)"
          ],
          [
            "Insert",
            "Θ(log n)",
            "Θ(log_m n)"
          ],
          [
            "Delete",
            "Θ(log n)",
            "Θ(log_m n)"
          ],
          [
            "Range scan, k items (B+)",
            "Θ(log n + k)",
            "Θ(log_m n + k/B)"
          ],
          [
            "Height",
            "—",
            "⌈log_m n⌉"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "A binary tree on disk",
            "body": "Backing an on-disk index with a BST or red-black tree means one seek per level and ~30 levels for a billion keys — orders of magnitude more I/O than a B+ tree's three or four. Use a B+ tree whose node is sized to fill a disk page so the fanout (and thus the height saved) is maximal."
          },
          {
            "term": "Mis-sized nodes",
            "body": "Nodes much smaller than a page waste each expensive read on too few keys, making the tree needlessly tall; nodes far larger than a page blow the cache and make in-node search costly. Tune the node size to roughly the underlying page/block size to balance fanout against per-node work."
          },
          {
            "term": "Random keys shred the leaves",
            "body": "A B+ index keyed on a random value like a UUID scatters inserts across the whole tree, causing constant leaf splits, poor page fill, and heavy write amplification — the well-known 'UUID primary key is slow' problem. Prefer monotonic keys (auto-increment, time-ordered IDs) for insert-heavy indexes, or tune the fill factor."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Heaps & Priority Queues": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Space"
        ],
        "rows": [
          [
            "Peek min / max",
            "Θ(1)",
            "—"
          ],
          [
            "Insert (sift-up)",
            "Θ(log n)",
            "Θ(1)"
          ],
          [
            "Extract-min (sift-down)",
            "Θ(log n)",
            "Θ(1)"
          ],
          [
            "Build-heap from array",
            "Θ(n)",
            "Θ(1)"
          ],
          [
            "Search arbitrary value",
            "Θ(n)",
            "—"
          ],
          [
            "Storage",
            "—",
            "Θ(n)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Treating it as a searchable set",
            "body": "A heap is ordered only along root-to-leaf paths, not globally, so `contains(x)`, find, or delete-arbitrary are all `O(n)` — siblings are unordered. If you need decrease-key or arbitrary delete, keep a side hash map from value to its array index and update it on every swap; if you need ordered search, use a balanced BST instead."
          },
          {
            "term": "Building by n repeated inserts",
            "body": "Pushing `n` items one at a time is `O(n log n)`, but bottom-up heapify — sifting down from the last internal node backward — is `Θ(n)` because most nodes barely move. Heapify the whole array at once (`heapq.heapify`) instead of looping `heappush`."
          },
          {
            "term": "Stale entries in a lazy priority queue",
            "body": "Dijkstra-style code that pushes updated priorities without removing the old tuples leaves outdated entries in the heap; popping them and acting on stale state corrupts the result. Use lazy deletion — tag each pop and skip any node already finalized — or a true decrease-key backed by a position map."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Tries & Radix Trees": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Space"
        ],
        "rows": [
          [
            "Insert (key length k)",
            "Θ(k)",
            "Θ(k)"
          ],
          [
            "Search / contains",
            "Θ(k)",
            "Θ(1)"
          ],
          [
            "Prefix enumeration",
            "Θ(p + out)",
            "Θ(out)"
          ],
          [
            "Delete",
            "Θ(k)",
            "Θ(1)"
          ],
          [
            "Naive trie storage",
            "—",
            "Θ(Σ × nodes)"
          ],
          [
            "Radix tree storage",
            "—",
            "Θ(total chars)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Per-node alphabet arrays",
            "body": "Giving every node a fixed child array sized to the alphabet (256, or far more for Unicode) wastes enormous memory when branching is sparse — most slots are empty. Store children in a hash map or small sorted list per node, or compress the whole structure into a radix tree."
          },
          {
            "term": "Long single-child chains",
            "body": "Keys with long unique tails produce deep runs of one-child nodes that add depth and allocations with zero branching benefit, dwarfing a plain hash set's footprint. Radix/Patricia compression merges each such run into a single labeled edge, keeping only the real decision points."
          },
          {
            "term": "Using a trie where a hash set fits",
            "body": "If you only need exact membership with no prefix, ordered, or longest-match queries, a trie pays `O(k)` and heavy memory for what a hash set does in `O(1)`. Reach for a trie only when its prefix/ordering powers are the point; otherwise a hash table wins."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Segment Trees & Fenwick Trees": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Property",
          "Segment tree",
          "Fenwick / BIT"
        ],
        "rows": [
          [
            "Build",
            "Θ(n)",
            "Θ(n)"
          ],
          [
            "Range query",
            "Θ(log n)",
            "Θ(log n)"
          ],
          [
            "Point update",
            "Θ(log n)",
            "Θ(log n)"
          ],
          [
            "Memory",
            "≈ 4n",
            "n + 1"
          ],
          [
            "Operations",
            "any associative",
            "invertible (sum)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Recomputing on a mixed workload",
            "body": "When both range queries and point updates are frequent, a prefix-sum array (`O(1)` query but `O(n)` update) or a per-query rescan (`O(n)`) both blow up. A segment tree or Fenwick tree makes *both* `O(log n)`, which is the whole reason they exist."
          },
          {
            "term": "A Fenwick tree for min / max",
            "body": "The BIT derives a range from `prefix(r) − prefix(l−1)`, and that subtraction only works for invertible operations like sum — applying it to min or max gives nonsense. Use a segment tree for non-invertible aggregates, or a sparse table for static range-min with no updates."
          },
          {
            "term": "Off-by-one and 1-indexing traps",
            "body": "A Fenwick tree must be 1-indexed — index 0 has `0 & −0 == 0`, so the update loop never advances and hangs — and a segment tree under-sized below `4n` reads out of bounds. Use 1-based indexing for the BIT and allocate `4n` (or twice the next power of two) for the segment tree."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Comparison Sorts": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Algorithm",
          "Avg / worst time",
          "Space · stability"
        ],
        "rows": [
          [
            "Quicksort",
            "Θ(n log n) / Θ(n²)",
            "Θ(log n) · unstable"
          ],
          [
            "Mergesort",
            "Θ(n log n) / Θ(n log n)",
            "Θ(n) · stable"
          ],
          [
            "Heapsort",
            "Θ(n log n) / Θ(n log n)",
            "Θ(1) · unstable"
          ],
          [
            "Lower bound",
            "Ω(n log n)",
            "any comparison sort"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Quicksort on sorted input",
            "body": "Choosing the first or last element as the pivot on already-sorted or reverse-sorted data produces maximally lopsided partitions — `n` levels deep — collapsing quicksort to `Θ(n²)`. Randomize the pivot or use median-of-three, and fall back to heapsort past a depth limit (introsort, next chapters)."
          },
          {
            "term": "Recursion-depth overflow",
            "body": "Quicksort's worst case recurses `O(n)` deep and blows the call stack on large adversarial inputs. Recurse into the *smaller* partition and loop on the larger one, which caps the live stack depth at `O(log n)` regardless of pivot luck."
          },
          {
            "term": "Assuming stability you do not have",
            "body": "Quicksort and heapsort reorder equal keys, so a two-pass 'sort by date, then by name' silently scrambles the date order within each name. Use a stable sort (mergesort or Timsort) when ties must be preserved, or fold a tiebreaker into the comparison key."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Linear-Time Sorts": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Algorithm",
          "Time",
          "Space / note"
        ],
        "rows": [
          [
            "Counting sort",
            "Θ(n + k)",
            "Θ(n + k) · stable"
          ],
          [
            "Radix sort (LSD)",
            "Θ(d · (n + b))",
            "Θ(n + b) · stable"
          ],
          [
            "Bucket sort (average)",
            "Θ(n)",
            "Θ(n)"
          ],
          [
            "Bucket sort (worst)",
            "Θ(n²)",
            "Θ(n)"
          ],
          [
            "vs comparison bound",
            "beats Ω(n log n)",
            "by not comparing"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "A key range far larger than n",
            "body": "Counting- or bucket-sorting keys with range `k ≫ n` — say a thousand random 64-bit values — spends `O(k)` time and memory on a giant mostly-empty count array, losing badly to `O(n log n)`. Only use counting sort when `k = O(n)`; decompose wide keys into small-base digits and use radix instead."
          },
          {
            "term": "An unstable digit pass in radix",
            "body": "Radix LSD relies on each digit pass preserving the order established by previous (less significant) passes; if the inner sort is not stable, those orderings are destroyed and the result is wrong. The per-digit sort must be stable — counting sort is; never plug in quicksort."
          },
          {
            "term": "Bucket sort on skewed data",
            "body": "Bucket sort is `O(n)` only when keys spread evenly; a clustered distribution dumps most elements into one bucket, which then costs `O(n²)` to sort. Verify near-uniformity (or transform the keys), size the bucket count near `n`, and fall back to a comparison sort if the data is lumpy."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Production Sorts": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Sort",
          "Typical",
          "Worst · properties"
        ],
        "rows": [
          [
            "Timsort",
            "Θ(n) on runs",
            "Θ(n log n) · stable, Θ(n) aux"
          ],
          [
            "Introsort",
            "Θ(n log n)",
            "Θ(n log n) · unstable, Θ(log n)"
          ],
          [
            "Plain quicksort",
            "Θ(n log n)",
            "Θ(n²) worst — why fallback exists"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Cross-language stability assumptions",
            "body": "Python's and Java's object sorts use Timsort and are stable, but `C++`'s `std::sort` is Introsort and is *not* stable — porting code that quietly relied on equal keys keeping their order will silently misorder. Use `std::stable_sort` in `C++`, or fold a tiebreaker into the comparison key."
          },
          {
            "term": "Expecting adaptivity from a non-adaptive sort",
            "body": "Timsort is `Θ(n)` on nearly-sorted or append-heavy data because it reuses existing runs; quicksort and introsort gain nothing from pre-sortedness. For incrementally-growing or mostly-ordered data, pick an adaptive sort rather than re-running a non-adaptive one each time."
          },
          {
            "term": "An expensive comparator called n log n times",
            "body": "Both sorts invoke the comparison `Θ(n log n)` times, so an `O(m)` comparator (deep object compare, locale-aware string compare) makes the whole sort `Θ(n log n · m)`. Precompute a cheap sort key once per element — `key=` in Python, the decorate-sort-undecorate pattern — so each comparison is `O(1)`."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Graph Representations": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Adjacency matrix",
          "Adjacency list"
        ],
        "rows": [
          [
            "Space",
            "Θ(V²)",
            "Θ(V + E)"
          ],
          [
            "Edge exists? (u, v)",
            "Θ(1)",
            "Θ(deg u)"
          ],
          [
            "Enumerate neighbors",
            "Θ(V)",
            "Θ(deg u)"
          ],
          [
            "Iterate all edges",
            "Θ(V²)",
            "Θ(V + E)"
          ],
          [
            "Best fit",
            "dense (E ≈ V²)",
            "sparse (E ≪ V²)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "A matrix for a large sparse graph",
            "body": "Storing a 10-million-user social graph as a matrix demands `10¹⁴` cells — impossible — even though the real edges number perhaps `10⁹`. For sparse graphs (nearly all real ones) use an adjacency list, whose footprint scales with edges actually present, not with vertex pairs."
          },
          {
            "term": "A list for constant edge probes on a dense graph",
            "body": "If the workload is repeated random 'is `u` adjacent to `v`?' queries on a dense graph, each list lookup costs `O(deg)` and adds up. Use a matrix for `O(1)` tests, or back each vertex with a hash set of neighbors to keep `O(1)` checks while staying sparse-friendly."
          },
          {
            "term": "Forgetting the reverse edge",
            "body": "In an undirected graph, adding only `u → v` to the list (or setting only `matrix[u][v]`) silently makes the graph directed, so a traversal misses the edge from `v`'s side. Always insert both directions — `u → v` and `v → u` — and keep the matrix symmetric."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Graph Traversal": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Property",
          "BFS",
          "DFS"
        ],
        "rows": [
          [
            "Time",
            "Θ(V + E)",
            "Θ(V + E)"
          ],
          [
            "Frontier structure",
            "FIFO queue",
            "stack / recursion"
          ],
          [
            "Extra space",
            "Θ(V) widest layer",
            "Θ(V) deepest path"
          ],
          [
            "Shortest unweighted path",
            "yes",
            "no"
          ],
          [
            "Signature uses",
            "levels, bipartite",
            "topo sort, cycle, SCC"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "No visited set",
            "body": "Without marking visited vertices, any cycle loops forever and even a DAG gets re-explored exponentially. Mark vertices visited — and for BFS, mark them when *enqueuing*, not when dequeuing, or the same vertex gets queued multiple times before it is first processed."
          },
          {
            "term": "Recursive DFS stack overflow",
            "body": "Recursive DFS rides the call stack, so a long path or skewed graph blows Python's ~1000-frame recursion limit (or the native stack in other languages). Use an iterative DFS with an explicit stack for large or deep graphs rather than relying on recursion."
          },
          {
            "term": "Using DFS for shortest paths",
            "body": "DFS finds *a* path, not the shortest — it commits to one deep route and may reach the target the long way around. For fewest-edge shortest paths in an unweighted graph use BFS, and reconstruct the route from the parent pointers its layer-tree records."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Shortest Paths": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Algorithm",
          "Time",
          "Handles"
        ],
        "rows": [
          [
            "BFS (unweighted)",
            "Θ(V + E)",
            "unit weights only"
          ],
          [
            "Dijkstra (binary heap)",
            "Θ((V + E) log V)",
            "non-negative weights"
          ],
          [
            "Dijkstra (Fibonacci)",
            "Θ(E + V log V)",
            "non-negative weights"
          ],
          [
            "Bellman-Ford",
            "Θ(V · E)",
            "negatives; finds neg cycle"
          ],
          [
            "A* (admissible h)",
            "≤ Dijkstra",
            "non-negative + heuristic"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Dijkstra with negative edges",
            "body": "A single negative edge can offer a cheaper route to a vertex Dijkstra already finalized, but the greedy lock means it never reconsiders — so the distances come out wrong (note: a negative edge is enough; you do not need a negative cycle). Use Bellman-Ford for negative weights, or Johnson's algorithm for all-pairs."
          },
          {
            "term": "An inadmissible A* heuristic",
            "body": "If `h` ever overestimates the true remaining cost, A* can settle the goal via a suboptimal path and return it, forfeiting optimality. Keep `h` admissible — straight-line distance is `≤` any real road distance, for example — and prefer a consistent `h` to also avoid re-expanding nodes."
          },
          {
            "term": "No priority queue, or stale heap entries",
            "body": "Re-scanning all vertices for the minimum makes Dijkstra `Θ(V²)` (fine when dense, wasteful when sparse), and a lazy heap that never skips outdated tuples will process stale, too-large distances. Use a binary heap with lazy deletion — discard a popped entry whose distance exceeds the current best — or a decrease-key heap."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Minimum Spanning Trees": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Algorithm",
          "Time",
          "Best for"
        ],
        "rows": [
          [
            "Kruskal",
            "Θ(E log E)",
            "sparse; edge-centric"
          ],
          [
            "Prim (binary heap)",
            "Θ(E log V)",
            "general"
          ],
          [
            "Prim (array)",
            "Θ(V²)",
            "dense graphs"
          ],
          [
            "Output",
            "V − 1 edges",
            "minimum total weight"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Running MST on a directed graph",
            "body": "MST is defined only for undirected graphs; the directed counterpart is the minimum arborescence, solved by the Chu-Liu/Edmonds algorithm, not by Kruskal or Prim. Applying an MST algorithm to a digraph quietly produces a meaningless result — use Edmonds' algorithm when edges have direction."
          },
          {
            "term": "Kruskal without Union-Find",
            "body": "Testing each candidate edge for a cycle by running a fresh BFS/DFS makes the cycle checks dominate at `O(E · V)`. Back the connectivity test with a disjoint-set structure using path compression and union by rank, which makes 'same component?' near-`O(1)` (next chapter)."
          },
          {
            "term": "Mistaking the MST for a shortest-path tree",
            "body": "An MST minimizes the *sum* of all edge weights, which is not the same as minimizing the distance from a root to every vertex — those differ in general, and tied weights also mean the MST is not unique. Use Dijkstra for source-to-all shortest paths; never substitute one for the other."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Union-Find": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Operation",
          "Time",
          "Note"
        ],
        "rows": [
          [
            "make_set",
            "Θ(1)",
            "one node"
          ],
          [
            "find / union (naive)",
            "O(n)",
            "degenerate chains"
          ],
          [
            "+ union by rank/size",
            "O(log n)",
            "bounded height"
          ],
          [
            "+ path compression",
            "O(α(n)) amortized",
            "≈ constant"
          ],
          [
            "m ops on n elements",
            "O(m · α(n))",
            "near-linear"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Skipping the optimizations",
            "body": "Plain `union`/`find` with neither trick lets a chain of unions build a linear tree, making every `find` `O(n)` and a Kruskal run quadratic. Always apply union by rank/size *and* path compression together — each alone only reaches `O(log n)`; only the pair gives the `α(n)` bound."
          },
          {
            "term": "Mishandling rank on merge",
            "body": "Union by rank works only if rank is updated correctly: when two roots of *equal* rank merge, the surviving root's rank increases by one; otherwise it stays. Bumping rank on every union (or never) breaks the height guarantee and silently degrades performance back toward `O(log n)` or worse."
          },
          {
            "term": "Expecting deletion or undo",
            "body": "DSU only merges sets and reports representatives — it cannot remove an element from a set or cleanly undo a `union`. For dynamic connectivity with deletions use link-cut trees or Euler-tour trees; for batch problems needing rollback, use an offline union-find with an explicit operation stack."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Divide & Conquer and the Master Theorem": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Recurrence",
          "Solution",
          "Example"
        ],
        "rows": [
          [
            "T(n/2) + O(1)",
            "Θ(log n)",
            "binary search"
          ],
          [
            "2T(n/2) + O(n)",
            "Θ(n log n)",
            "mergesort"
          ],
          [
            "2T(n/2) + O(1)",
            "Θ(n)",
            "tree traversal"
          ],
          [
            "3T(n/2) + O(n)",
            "Θ(n^1.585)",
            "Karatsuba"
          ],
          [
            "7T(n/2) + O(n²)",
            "Θ(n^2.807)",
            "Strassen"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Applying it to the wrong recurrence shape",
            "body": "The Master Theorem only covers `a·T(n/b) + f(n)` with constant `a` and `b > 1`. Recurrences that *subtract* (`T(n) = T(n−1) + n`) or split unevenly (`T(n) = T(n/3) + T(2n/3) + n`) are outside it — solve those with the recursion-tree method or the Akra-Bazzi theorem."
          },
          {
            "term": "The gap between cases",
            "body": "If `f(n)` exceeds the watershed but only by a non-polynomial factor (a stray `log n`, say), it falls between Case 2 and Case 3 and none of the three rules apply. Reach for the extended Master Theorem or draw the recursion tree and sum the levels directly."
          },
          {
            "term": "Misreading a, b, or f",
            "body": "Counting subproblems wrong — treating mergesort as one recursive call, or forgetting the `Θ(n)` merge — yields a completely wrong bound. Identify `a` (how many recursive calls), `b` (the size-shrink factor), and `f(n)` (all non-recursive work in one call) carefully before plugging in."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Dynamic Programming": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Problem",
          "Naive recursion",
          "With DP"
        ],
        "rows": [
          [
            "Fibonacci",
            "Θ(φⁿ)",
            "Θ(n)"
          ],
          [
            "0/1 Knapsack",
            "Θ(2ⁿ)",
            "Θ(n · W)"
          ],
          [
            "Longest common subseq.",
            "Θ(2ⁿ)",
            "Θ(m · n)"
          ],
          [
            "Edit distance",
            "Θ(3ⁿ)",
            "Θ(m · n)"
          ],
          [
            "Coin change",
            "exponential",
            "Θ(n · amount)"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "No caching on overlapping calls",
            "body": "Leaving a recursion that revisits the same subproblems uncached keeps it exponential — naive Fibonacci or knapsack will hang on modest inputs. Add a memoization cache keyed by the subproblem, or rewrite as a bottom-up table; either makes each state cost-once."
          },
          {
            "term": "Assuming optimal substructure that is not there",
            "body": "DP only works if optimal sub-answers compose into an optimal whole — and some problems fail this, like the longest *simple* path in a general graph (NP-hard), where subpaths cannot be freely combined without repeating vertices. Confirm the substructure property before committing to a DP formulation."
          },
          {
            "term": "An incomplete state",
            "body": "Omitting a parameter that actually distinguishes subproblems — keying knapsack on item index but not remaining capacity — corrupts the cache and yields wrong answers, as does filling the table in an order where a needed dependency isn't ready. Put every relevant parameter in the state key and compute in dependency order."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Greedy Algorithms": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Greedy problem",
          "Time",
          "Optimal?"
        ],
        "rows": [
          [
            "Activity selection",
            "Θ(n log n)",
            "yes ✓"
          ],
          [
            "Huffman coding",
            "Θ(n log n)",
            "yes ✓"
          ],
          [
            "Fractional knapsack",
            "Θ(n log n)",
            "yes ✓"
          ],
          [
            "Dijkstra / Prim / Kruskal",
            "Θ(E log V)",
            "yes ✓"
          ],
          [
            "Coin change (arbitrary)",
            "Θ(n)",
            "NO ✗ → DP"
          ],
          [
            "0/1 knapsack",
            "—",
            "NO ✗ → DP"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Greedy on a problem without the property",
            "body": "0/1 knapsack cannot split items, so taking the best value-per-weight ratio first can leave capacity that a different combination would have filled more valuably — greedy returns a suboptimal pack. Only the *fractional* knapsack is greedy-safe; the 0/1 version needs the DP table from the previous chapter."
          },
          {
            "term": "The wrong greedy criterion",
            "body": "Activity selection by earliest finish is optimal, but sorting the same intervals by earliest start or shortest duration quietly selects fewer activities. Never trust a greedy ordering on intuition — prove it with an exchange argument (or identify the matroid) before relying on it."
          },
          {
            "term": "Non-canonical coin systems",
            "body": "Greedy coin change is optimal only for canonical denomination sets (like `1, 5, 10, 25`); with sets such as `{1, 3, 4}` — or a normal set with one coin removed — greedy overshoots the minimum count. Use the DP coin-change recurrence (`Θ(n · amount)`), or first verify the system is canonical."
          }
        ]
      }
    ]
  },
  "data-structures-algorithms:Probabilistic Structures": {
    "sections": [
      {
        "kind": "table",
        "heading": "Complexity",
        "cols": [
          "Property",
          "Skip list",
          "Bloom filter"
        ],
        "rows": [
          [
            "Search / membership",
            "O(log n) expected",
            "O(k) ≈ O(1)"
          ],
          [
            "Insert",
            "O(log n) expected",
            "O(k)"
          ],
          [
            "Delete",
            "O(log n) expected",
            "unsupported → counting"
          ],
          [
            "Space",
            "O(n) + pointers",
            "O(m) bits, ~few/elem"
          ],
          [
            "Exactness",
            "exact, ordered",
            "false positives possible"
          ]
        ]
      },
      {
        "kind": "deflist",
        "heading": "How it breaks",
        "items": [
          {
            "term": "Trusting a Bloom \"present\" as certain",
            "body": "A positive result can be a false positive, so using it where correctness depends on it — 'the filter says this key exists, skip the database' returning phantom data — is a bug. Treat a positive as 'maybe, verify against the source of truth'; only the *negative* answer ('definitely absent') is guaranteed."
          },
          {
            "term": "Deleting from a plain Bloom filter",
            "body": "Clearing an element's `k` bits also clears bits it shares with other elements, which then start reporting absent — introducing false negatives and corrupting unrelated keys. Never reset bits in a standard Bloom filter; if deletion is required, use a counting Bloom filter whose slots are small counters you increment and decrement."
          },
          {
            "term": "Under-sizing m or choosing k poorly",
            "body": "Too few bits or the wrong number of hash functions drives the false-positive rate toward 1 — a saturated, mostly-ones array answers 'yes' to everything. Size the filter from the expected count `n` and target rate `p`: `m = −n·ln p / (ln 2)²` bits and `k = (m/n)·ln 2` hashes."
          }
        ]
      }
    ]
  },
  "ai-llm:The Neuron": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "The artificial neuron was described on paper in 1943 by McCulloch and Pitts — decades before any computer could run more than a handful of them at once."
      }
    ]
  },
  "ai-llm:Layers & Deep Networks": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Depth beats width: a deep, narrow network can represent patterns that would require an astronomically wider shallow network to match."
      }
    ]
  },
  "ai-llm:Activation Functions": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "ReLU's whole definition is \"max(0, x)\" — yet swapping it in for older smooth functions was a key trick that finally made very deep networks practical to train."
      }
    ]
  },
  "ai-llm:Training & Backpropagation": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Backpropagation was popularized in 1986, but the core idea sat largely idle for years — the world simply lacked the data and compute to reveal its power."
      }
    ]
  },
  "ai-llm:Overfitting & Generalization": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Dropout was partly inspired by fraud prevention — shuffling which neurons are active is like rotating bank tellers so no fixed group can quietly collude on a shortcut."
      }
    ]
  },
  "ai-llm:Tokenization": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "To an LLM a leading space usually belongs to the word that follows it — so \" cat\" and \"cat\" are often two different tokens, which is why spacing quietly changes results."
      }
    ]
  },
  "ai-llm:Embeddings": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Embedding math can be uncannily geometric: the vector for \"king\" minus \"man\" plus \"woman\" lands remarkably close to the vector for \"queen.\""
      }
    ]
  },
  "ai-llm:The Attention Mechanism": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "The 2017 paper that introduced this design was literally titled \"Attention Is All You Need\" — and for modern language models, it largely was."
      }
    ]
  },
  "ai-llm:Multi-Head Attention": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Researchers can peek inside trained models and find heads with clear specialties — some reliably connect pronouns to the right noun, others track punctuation or syntax."
      }
    ]
  },
  "ai-llm:The Transformer Block": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Inside the feed-forward network the model briefly expands each token to about four times its size and shrinks it back — most of a model's raw parameters live in that bulge."
      }
    ]
  },
  "ai-llm:Stacking Layers (The Full Model)": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "The largest models hold hundreds of billions of parameters — more individual numbers than there are stars in the Milky Way."
      }
    ]
  },
  "ai-llm:The Language Modeling Objective": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "This one objective — guess the next token — is enough to teach grammar, facts, translation, and even arithmetic, all as side effects of getting better at prediction."
      }
    ]
  },
  "ai-llm:Pre-training Data": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Data quality can matter more than raw quantity — a smaller, well-filtered corpus often beats a larger, noisier one trained at the same cost."
      }
    ]
  },
  "ai-llm:The Pre-training Loop": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "A single training run can execute this loop hundreds of thousands of times and run for weeks across thousands of GPUs without ever stopping."
      }
    ]
  },
  "ai-llm:Compute & Scale": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Training a frontier model can cost tens of millions of dollars in compute and use as much electricity as a small town does over the same stretch of time."
      }
    ]
  },
  "ai-llm:Fine-tuning & Instruction Tuning": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "A few thousand to a few hundred thousand well-written examples can dramatically reshape behavior — tiny next to pre-training, yet enough to turn a rambler into an assistant."
      }
    ]
  },
  "ai-llm:RLHF — Reinforcement Learning from Human Feedback": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "RLHF was the key ingredient that turned capable-but-unruly base models into the polished, instruction-following assistants that sparked the recent AI boom."
      }
    ]
  },
  "ai-llm:The Inference Loop": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Because each token depends on all the ones before it, an LLM literally cannot write the end of a sentence before the middle — it has no global draft, only the next word."
      }
    ]
  },
  "ai-llm:Decoding Strategies": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Cranking temperature toward zero makes a model nearly deterministic; pushing it high enough turns coherent prose into surreal, dreamlike word salad."
      }
    ]
  },
  "ai-llm:Context Window": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Going from a 4,000-token to a 128,000-token window is not 32× more attention work but closer to 1,000× — which is why long context was such a hard engineering problem."
      }
    ]
  },
  "ai-llm:RAG — Retrieval-Augmented Generation": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "RAG lets a model answer questions about documents written long after it was trained — its knowledge can be refreshed just by adding files to the database, no retraining required."
      }
    ]
  },
  "ai-llm:AI Agents & Tool Use": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Giving a model a humble calculator can beat a vastly larger model at arithmetic — because doing math reliably and predicting the next token are genuinely different skills."
      }
    ]
  },
  "ai-llm:Prompt Engineering": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "Simply adding \"let's think step by step\" was shown to boost reasoning accuracy on hard problems — a free upgrade that costs nothing but a few tokens."
      }
    ]
  },
  "ai-llm:Multimodal Models": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "To a multimodal model a 16×16 image patch is just another \"word\" in its vocabulary of vectors — which is how it can describe a photo it has never seen before."
      }
    ]
  },
  "ai-llm:What LLMs Can't Do (Yet)": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Fun fact",
        "text": "A model can ace an expert exam yet stumble on a child's riddle — fluency is not understanding, and benchmark scores can hide surprisingly brittle gaps."
      }
    ]
  },
  "cloud-architecture:Strangler Fig Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "A large legacy monolith must keep serving production traffic while you modernize it piece by piece.",
          "Risk tolerance is low and a full rewrite would take a year before any value ships.",
          "You can identify clear seams (bounded capabilities) that can be extracted independently."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Incremental, low-risk migration",
          "System stays shippable throughout",
          "Easy rollback per extracted seam"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Long-lived dual stack to maintain",
          "Routing/facade complexity",
          "Migration may never finish without discipline"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Proxy becomes a bottleneck",
            "body": "All traffic funnels through one facade; if it is under-provisioned latency and outages spread everywhere. Detect via rising p99 at the proxy and saturation alarms."
          },
          {
            "term": "Data consistency during the split",
            "body": "Old and new code write to overlapping data, causing drift. Detect with reconciliation jobs comparing monolith vs service records."
          },
          {
            "term": "Strangle paralysis",
            "body": "The migration stalls half-done, leaving permanent dual maintenance. Detect by tracking the percentage of traffic still on the monolith trending flat."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "API Gateway — front-door routing · ALB listener rules — path-based split · Lambda / ECS — new services"
          },
          {
            "term": "GCP",
            "body": "Cloud Endpoints — facade · Cloud Load Balancing — URL maps · Cloud Run — new services"
          },
          {
            "term": "Azure",
            "body": "API Management — facade & policies · App Service — new services · Front Door — routing"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Sidecar Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Many services in different languages all need the same logging, TLS, or metrics behavior.",
          "You want to add a platform capability without redeploying or rewriting every app.",
          "A third-party agent must run co-located with the app but stay independently upgradeable."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Keeps app code clean and focused",
          "Language-agnostic shared capability",
          "Patch platform features independently"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Doubles container count and resource use",
          "Coupled lifecycle with the app",
          "Operational/version-drift overhead"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Sidecar crash takes down the pod",
            "body": "If the app depends on the sidecar for networking and it dies, the whole unit is unhealthy. Detect with per-container liveness probes and restart metrics."
          },
          {
            "term": "Resource contention",
            "body": "Sidecar and app compete for the same CPU/memory limits, throttling the app under load. Detect via per-container utilization and throttling counters."
          },
          {
            "term": "Version drift across the fleet",
            "body": "Sidecars upgrade at different rates, producing inconsistent behavior. Detect with a fleet inventory dashboard of sidecar image versions."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "ECS task with two containers · App Mesh — Envoy sidecar · CloudWatch agent sidecar"
          },
          {
            "term": "GCP",
            "body": "GKE pod — Istio sidecar injection · Cloud Service Mesh · Ops Agent sidecar"
          },
          {
            "term": "Azure",
            "body": "AKS — Dapr sidecar · Azure Service Mesh · AKS sidecar log/metric agents"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Ambassador Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Clients across several languages need identical retry, timeout, and auth behavior on outbound calls.",
          "You must talk to a backend that speaks a different protocol than your app expects.",
          "You want resilience policy (circuit breaking, backoff) configured by ops, not baked into each app."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Centralizes client resilience logic",
          "Transparent protocol translation",
          "Consistent egress behavior fleet-wide"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Extra network hop and latency",
          "Another component to operate",
          "Misconfig can break all outbound calls"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Hidden latency from added hops",
            "body": "Every call now traverses the ambassador, adding tail latency. Detect by comparing app-to-localhost vs end-to-end timing."
          },
          {
            "term": "Retry amplification",
            "body": "Aggressive retries multiply load on an already-failing dependency. Detect via outbound request-count spikes during downstream errors."
          },
          {
            "term": "Auth/token misconfiguration",
            "body": "A stale or wrong injected token silently fails all egress. Detect with 401/403 rate alarms per ambassador."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "App Mesh — Envoy outbound · API Gateway SDK clients · Lambda extension as egress proxy"
          },
          {
            "term": "GCP",
            "body": "Apigee adapter · Cloud Service Mesh egress gateway · Traffic Director client config"
          },
          {
            "term": "Azure",
            "body": "Dapr service invocation · KEDA with ambassador proxy · API Management self-hosted gateway"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Anti-Corruption Layer (ACL)": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "You integrate with a legacy or vendor system whose model would corrupt your clean domain.",
          "The external API changes often and you want one isolated place to absorb the churn.",
          "Multiple services need the same external data but must not depend on its foreign shape."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Protects domain model integrity",
          "Isolates upstream changes",
          "Single, testable translation point"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Extra mapping code to maintain",
          "Translation latency/overhead",
          "Risk of becoming a complex hotspot"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Translation drift",
            "body": "The external model changes and the mapping silently mistranslates fields. Detect with schema-validation checks and contract tests against the upstream."
          },
          {
            "term": "ACL becomes a god service",
            "body": "Too much logic accretes in the layer until it is itself a fragile monolith. Detect by tracking its change frequency and code size."
          },
          {
            "term": "Lossy mapping",
            "body": "Fields with no clean equivalent get dropped, losing data. Detect with round-trip tests comparing source vs translated payloads."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "Lambda — translator function · EventBridge — transform & route · Step Functions — mapping flow"
          },
          {
            "term": "GCP",
            "body": "Cloud Functions — translator · Pub/Sub — message transform · Workflows — mapping orchestration"
          },
          {
            "term": "Azure",
            "body": "Azure Functions — ACL adapter · Logic Apps — transform actions · Service Bus — message mapping"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Event-Driven Architecture": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Multiple teams need to react to the same business fact without coordinating deploys.",
          "Producers and consumers must scale and fail independently of one another.",
          "You expect to add new consumers of existing events over time."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Loose coupling between services",
          "Independent scaling & deploys",
          "Easy to add new consumers"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Harder to trace end-to-end flows",
          "Eventual consistency to reason about",
          "Ordering & duplicate handling required"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Out-of-order events",
            "body": "Consumers receive events in the wrong sequence and compute bad state. Detect with sequence numbers and gap/ordering checks."
          },
          {
            "term": "Duplicate delivery",
            "body": "At-least-once brokers re-deliver, causing double processing. Detect via idempotency keys and duplicate-rate metrics."
          },
          {
            "term": "Unbounded consumer lag",
            "body": "A slow consumer falls behind until the backlog explodes. Detect with consumer-lag and queue-depth alarms."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "EventBridge — event router · SNS + SQS — pub/sub & buffering · Kinesis — streaming events"
          },
          {
            "term": "GCP",
            "body": "Pub/Sub — messaging backbone · Eventarc — event routing · Cloud Tasks — deferred work"
          },
          {
            "term": "Azure",
            "body": "Event Grid — event routing · Event Hubs — streaming · Service Bus — queues/topics"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Event Sourcing": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "You need a complete, tamper-evident audit trail of every change (finance, compliance).",
          "You want to derive new read models retroactively by replaying history.",
          "Temporal queries — 'what did state look like last Tuesday?' — are a real requirement."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Full audit log & time travel",
          "Rebuild any read model by replay",
          "Immutable, debuggable history"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Storage grows forever",
          "Replay & snapshot complexity",
          "Event schema versioning is hard"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Event store grows unbounded",
            "body": "History accumulates forever, inflating cost and replay time. Detect with store-size growth and replay-duration trends."
          },
          {
            "term": "Slow replay for old aggregates",
            "body": "Rebuilding a long-lived aggregate from scratch is expensive. Mitigate with snapshots; detect via aggregate-load latency."
          },
          {
            "term": "Schema evolution of old events",
            "body": "Changing event shapes breaks replay of historical data. Detect with versioned events and upcasting test coverage."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "DynamoDB + Streams — event store · Kinesis — replay stream · EventBridge Pipes — projections"
          },
          {
            "term": "GCP",
            "body": "Firestore — event store · Pub/Sub — replay · BigQuery — projections"
          },
          {
            "term": "Azure",
            "body": "Cosmos DB change feed — event store · Event Hubs — replay · Functions — projections"
          }
        ]
      }
    ]
  },
  "cloud-architecture:CQRS — Command Query Responsibility Segregation": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Read and write workloads have wildly different volumes or shapes (e.g. 1000:1 reads).",
          "Query patterns need denormalized views the write schema can't serve efficiently.",
          "You already use event sourcing and want query-optimized projections."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Independent read/write scaling",
          "Query-optimized read models",
          "Cleaner write-side business logic"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Eventual consistency to manage",
          "More moving parts to operate",
          "Projection sync complexity"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Confusing consistency window",
            "body": "Users write then immediately read stale data from the lagging read model. Detect with read-model lag metrics and user-reported 'my change vanished' reports."
          },
          {
            "term": "Projection lag",
            "body": "Projection workers fall behind under load, widening staleness. Detect via projection backlog and processing-time alarms."
          },
          {
            "term": "Read models drift out of sync",
            "body": "A missed or failed event leaves a projection permanently wrong. Detect with periodic reconciliation against the source."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "RDS — write side · DynamoDB / OpenSearch — read side · Lambda on DynamoDB Streams — projections"
          },
          {
            "term": "GCP",
            "body": "Cloud Spanner — writes · Firestore / BigQuery — reads · Dataflow — projections"
          },
          {
            "term": "Azure",
            "body": "Azure SQL — writes · Cosmos DB — reads · Azure Functions — projections"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Saga Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "A business process spans multiple services that each own their own data.",
          "You need atomicity across services but two-phase commit is impractical.",
          "Steps may fail independently and you can define meaningful compensations."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Distributed atomicity without 2PC",
          "Each service stays autonomous",
          "Explicit, testable failure handling"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Compensations are hard to design",
          "No isolation — intermediate states visible",
          "Complex to debug end-to-end"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Compensation failure",
            "body": "A compensating step itself fails, leaving the system half-undone. Detect with dead-letter queues on compensation actions and stuck-saga alarms."
          },
          {
            "term": "Lost saga state",
            "body": "Without durable tracking, a crash mid-saga leaves orphaned partial work. Detect with a saga-state store and timeout sweeps."
          },
          {
            "term": "Choreography spaghetti",
            "body": "Event-reaction chains become impossible to follow as steps grow. Detect by mapping event flows and watching for cyclic dependencies."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "Step Functions — orchestration sagas · EventBridge — choreography sagas · SQS — step messaging"
          },
          {
            "term": "GCP",
            "body": "Workflows — orchestration · Pub/Sub — choreography · Cloud Tasks — step retries"
          },
          {
            "term": "Azure",
            "body": "Durable Functions — orchestration · Service Bus — choreography · Logic Apps — flows"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Outbox Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "You must guarantee an event is published whenever and only when a DB write commits.",
          "You're integrating a relational write with an event-driven downstream.",
          "Lost or phantom events would cause real data-integrity problems."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Eliminates dual-write inconsistency",
          "At-least-once delivery guarantee",
          "Works with ordinary transactions"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Extra table + relay to operate",
          "Requires idempotent consumers",
          "Publish latency (poll interval)"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Relay falls behind",
            "body": "The publisher can't keep up and the outbox grows. Detect with unpublished-row count and relay-lag metrics."
          },
          {
            "term": "Duplicate publishes",
            "body": "A relay crash after publish but before marking sent re-emits the event. Detect via downstream idempotency and duplicate-rate tracking."
          },
          {
            "term": "Outbox table bloat",
            "body": "Published rows are never pruned, degrading the DB. Detect with table-size growth and run a cleanup/archival job."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "RDS — order + outbox tables · DMS / Lambda CDC — relay · EventBridge / SQS — target broker"
          },
          {
            "term": "GCP",
            "body": "Cloud SQL — outbox table · Datastream CDC — relay · Pub/Sub — target broker"
          },
          {
            "term": "Azure",
            "body": "Azure SQL — outbox + change tracking · Functions CDC — relay · Service Bus — target broker"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Serverless Architecture": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Traffic is spiky or unpredictable and you don't want to pay for idle servers.",
          "You need event-glue between cloud services without managing infrastructure.",
          "A small team wants to ship features without operating a fleet."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "No servers to manage or patch",
          "Scales to zero — pay per use",
          "Fast to ship event-driven code"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Cold-start latency",
          "Execution limits & vendor lock-in",
          "Harder testing and tracing"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Cold starts",
            "body": "Idle functions add startup latency to the first request. Detect with init-duration metrics; mitigate with provisioned concurrency."
          },
          {
            "term": "Execution-time limits",
            "body": "Long tasks hit the platform timeout (e.g. 15 min) and fail mid-run. Detect with timeout-error rates; offload long work elsewhere."
          },
          {
            "term": "Distributed-tracing blind spots",
            "body": "Many tiny functions make end-to-end failures hard to follow. Detect by adopting trace context propagation and gap analysis."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "Lambda + API Gateway · S3 / DynamoDB — triggers & store · EventBridge — event routing"
          },
          {
            "term": "GCP",
            "body": "Cloud Functions + Cloud Run · Pub/Sub — triggers · Firestore — store"
          },
          {
            "term": "Azure",
            "body": "Azure Functions + API Management · Blob Storage — triggers · Cosmos DB — store"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Fan-Out / Fan-In Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "A task splits into independent sub-tasks that can run concurrently.",
          "Total latency matters and parallelism beats sequential processing.",
          "You need to aggregate many partial results into one final answer."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Massive latency reduction via parallelism",
          "Independent, scalable workers",
          "Natural fit for serverless"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Partial-failure handling complexity",
          "Aggregator can bottleneck",
          "Harder to reason about timing"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Partial fan-in",
            "body": "Some workers fail and the aggregator can't form a complete result. Detect with per-branch success tracking and a completeness check."
          },
          {
            "term": "Timeout waiting for all workers",
            "body": "One slow worker stalls the whole aggregation. Detect via straggler timing and apply per-branch deadlines."
          },
          {
            "term": "Aggregator bottleneck",
            "body": "The fan-in step can't keep up with parallel output. Detect with aggregator queue depth and processing latency."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "SNS → multiple SQS + Lambda — fan-out · Step Functions Map state — fan-in · S3 events — trigger"
          },
          {
            "term": "GCP",
            "body": "Pub/Sub multi-subscription — fan-out · Workflows — fan-in · Cloud Functions — workers"
          },
          {
            "term": "Azure",
            "body": "Event Grid → multiple queues — fan-out · Durable Functions Task.WhenAll — fan-in · Functions — workers"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Competing Consumers Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Work items are independent and can be processed in any order.",
          "Throughput must scale horizontally by adding workers.",
          "You want automatic load balancing without a central dispatcher."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Linear horizontal scaling",
          "Self-balancing load",
          "Built-in retry via redelivery"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "No cross-message ordering",
          "Requires idempotent processing",
          "Poison pills need DLQ handling"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Poison-pill message",
            "body": "A malformed message repeatedly crashes whichever consumer picks it up. Detect with redelivery-count limits routing to a dead-letter queue."
          },
          {
            "term": "No ordering guarantee",
            "body": "Related messages process out of order across consumers. Detect by validating ordering assumptions; use partition keys if order matters."
          },
          {
            "term": "Lost in-flight message",
            "body": "A consumer crash before ack can drop or duplicate work. Detect with visibility-timeout tuning and at-least-once idempotency."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "SQS — shared queue · Lambda / ECS tasks — consumers · CloudWatch — scale on queue depth"
          },
          {
            "term": "GCP",
            "body": "Pub/Sub — shared subscription · Cloud Run / Functions — subscribers · Autoscaling on backlog"
          },
          {
            "term": "Azure",
            "body": "Service Bus queue · Azure Functions — consumers · Scale controller on queue length"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Durable Execution Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Workflows run for hours, days, or weeks and must survive restarts.",
          "Steps include human approvals or long sleeps between actions.",
          "You need exactly-once step semantics without hand-rolling state machines."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Crash-proof, resumable workflows",
          "Exactly-once step semantics",
          "Natural long-running orchestration"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Determinism constraints on code",
          "Engine lock-in & learning curve",
          "Versioning in-flight runs is tricky"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Non-deterministic code",
            "body": "Replay-based engines break if step logic isn't deterministic. Detect with engine determinism checks and avoid direct clock/random calls."
          },
          {
            "term": "Stuck workflows",
            "body": "A step waits forever on an event that never arrives. Detect with timeouts and stalled-instance dashboards."
          },
          {
            "term": "Version skew on in-flight runs",
            "body": "Deploying new workflow code breaks running instances. Detect with versioned definitions and migration tests."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "Step Functions — checkpointed state · Lambda — step activities · EventBridge Scheduler — timers"
          },
          {
            "term": "GCP",
            "body": "Workflows — durable execution · Cloud Tasks — scheduling · Cloud Functions — steps"
          },
          {
            "term": "Azure",
            "body": "Durable Functions — auto checkpointing · Storage — state store · Timers/entities — long waits"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Circuit Breaker Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "A downstream dependency can fail and you don't want callers to hang on timeouts.",
          "You can provide a sensible fallback or degraded response when it's unavailable.",
          "Cascading failures from one slow service threaten the whole system."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Prevents cascading failures",
          "Fast-fail instead of hanging",
          "Gives dependencies room to recover"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Threshold tuning is fiddly",
          "Fallback logic to design & test",
          "Can mask underlying problems"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Flapping",
            "body": "Thresholds too tight cause the breaker to open/close rapidly. Detect with state-transition rate metrics and tune cooldowns."
          },
          {
            "term": "Stale-open breaker",
            "body": "It stays open after the dependency recovers, blocking good traffic. Detect with probe-success vs open-duration monitoring."
          },
          {
            "term": "Bad fallback",
            "body": "The fallback returns wrong or stale data users act on. Detect by tracking fallback-served rate and downstream correctness."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "App Mesh — circuit breaking · Lambda — custom breaker logic · API Gateway + authorizer breaker"
          },
          {
            "term": "GCP",
            "body": "Cloud Service Mesh — circuit breaking · Traffic Director — outlier policies · GKE Istio config"
          },
          {
            "term": "Azure",
            "body": "API Management — circuit-breaker policy · Dapr — resiliency policies · AKS Istio config"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Bulkhead Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "One noisy tenant or feature could exhaust resources shared by everyone.",
          "Different workloads have different criticality and must not interfere.",
          "You need predictable isolation under load spikes."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Contains blast radius of failures",
          "Predictable isolation per workload",
          "Protects critical paths from noisy ones"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Lower overall resource efficiency",
          "More pools/queues to size & operate",
          "Partition boundaries are hard to get right"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Under-sized partition",
            "body": "A compartment's fixed allocation is too small and throttles normal load. Detect with per-partition saturation and rejection metrics."
          },
          {
            "term": "Wasted capacity",
            "body": "Idle partitions can't lend resources to a busy one, lowering utilization. Detect by comparing per-partition usage variance."
          },
          {
            "term": "Mis-partitioning",
            "body": "Wrong boundaries put correlated load in one bulkhead. Detect by analyzing which workloads spike together."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "Separate SQS queues per workload · Per-function Lambda concurrency limits · Account-level isolation"
          },
          {
            "term": "GCP",
            "body": "Separate Pub/Sub subscriptions · Cloud Run concurrency limits · Per-project quotas"
          },
          {
            "term": "Azure",
            "body": "Separate Service Bus queues · Functions host concurrency limits · Per-plan isolation"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Retry with Exponential Backoff & Jitter": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Failures are often transient (network blips, throttling, brief unavailability).",
          "Many clients may fail simultaneously and could create a retry storm.",
          "You want automatic recovery without manual intervention."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Automatic recovery from transients",
          "Jitter prevents retry storms",
          "DLQ captures permanent failures"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Added latency from waits",
          "Requires idempotent operations",
          "Can amplify load if mis-tuned"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Thundering herd (no jitter)",
            "body": "Synchronized retries spike load right when the service is recovering. Detect with request-rate spikes correlated to error events."
          },
          {
            "term": "Retrying non-idempotent ops",
            "body": "Retries duplicate side effects like double charges. Detect via idempotency keys and duplicate-action audits."
          },
          {
            "term": "Retry budget exhaustion",
            "body": "Endless retries amplify load instead of failing fast. Detect with retry-count metrics and enforce caps + DLQ."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "SQS redrive policy + DLQ · Lambda retry config · SDK retry with built-in jitter"
          },
          {
            "term": "GCP",
            "body": "Pub/Sub retry policy · Cloud Tasks retry config · Client-library backoff"
          },
          {
            "term": "Azure",
            "body": "Service Bus retry policy · Azure Functions retry policy · SDK retry with jitter"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Throttling & Rate Limiting Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "A service must be protected from overload or abusive callers.",
          "You sell tiered plans with different request allowances.",
          "Backpressure is needed to keep a downstream dependency healthy."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Protects services from overload",
          "Enforces fair, tiered usage",
          "Provides graceful backpressure"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Algorithm/state complexity",
          "Risk of throttling legitimate traffic",
          "Distributed counting is hard"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Burst at fixed-window boundary",
            "body": "Clients double their allowance across the window edge. Detect with per-second request distributions; use sliding windows."
          },
          {
            "term": "Distributed counter drift",
            "body": "Per-node counters undercount global rate. Detect by comparing node sums to a central counter; use shared state."
          },
          {
            "term": "No Retry-After guidance",
            "body": "Throttled clients retry immediately and keep failing. Detect via repeated 429s from the same client; emit Retry-After."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "API Gateway usage plans + keys · WAF rate-based rules · Lambda reserved concurrency"
          },
          {
            "term": "GCP",
            "body": "Cloud Endpoints rate limits · Apigee quota policies · Cloud Armor rate limiting"
          },
          {
            "term": "Azure",
            "body": "API Management rate-limit policy · Front Door rate-limiting rules · App Gateway WAF limits"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Database per Service Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Teams must evolve schemas and scale data independently.",
          "Different services genuinely need different database technologies.",
          "You want to prevent hidden coupling through a shared schema."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Independent schema evolution & scaling",
          "Polyglot persistence per workload",
          "No hidden coupling via shared DB"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Cross-service queries get complex",
          "Cross-service consistency is manual",
          "Reporting needs a separate pipeline"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Cross-service join sprawl",
            "body": "Queries that need data from several services become chatty API fan-outs. Detect with N+1 call patterns and latency from composite reads."
          },
          {
            "term": "Consistency across services",
            "body": "No single transaction spans services, so data can diverge. Detect with reconciliation checks; use sagas/events for consistency."
          },
          {
            "term": "Hard cross-service reporting",
            "body": "Analytics needs data spread across many stores. Detect by the rise of ad-hoc data exports; build a dedicated warehouse."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "Per-service RDS instance or DynamoDB table · No cross-account DB access · IAM-scoped data isolation"
          },
          {
            "term": "GCP",
            "body": "Per-service Cloud SQL or Firestore · Per-project data boundaries · IAM-scoped access"
          },
          {
            "term": "Azure",
            "body": "Per-service Azure SQL or Cosmos DB account · Per-service resource isolation · RBAC-scoped access"
          }
        ]
      }
    ]
  },
  "cloud-architecture:CQRS + Read Replicas Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Different query types need fundamentally different store technologies.",
          "Read volume far exceeds write volume and must scale separately.",
          "You need full-text, caching, and analytics views off the same source data."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Each query type on an optimal store",
          "Independent read scaling",
          "Search/cache/analytics off one source"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Replication lag / staleness",
          "Many stores to operate",
          "Keeping projections in sync"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Replication lag",
            "body": "Read stores trail the primary, serving stale data. Detect with per-store lag metrics and staleness alarms."
          },
          {
            "term": "Projection divergence",
            "body": "A failed CDC stream leaves a read store permanently wrong. Detect with periodic reconciliation against the primary."
          },
          {
            "term": "Operational sprawl",
            "body": "Each added store multiplies ops burden and failure surface. Detect via incident attribution per store and on-call load."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "RDS primary + read replicas · OpenSearch + ElastiCache · Redshift — analytics"
          },
          {
            "term": "GCP",
            "body": "Cloud Spanner — writes · Firestore + Memorystore · BigQuery — analytics"
          },
          {
            "term": "Azure",
            "body": "Azure SQL primary + read replicas · Cognitive Search + Redis Cache · Synapse — analytics"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Materialized View Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "An expensive join or aggregation is read far more often than its sources change.",
          "Read latency is critical (listing pages, dashboards) and recomputation is too slow.",
          "You can tolerate some staleness in exchange for fast reads."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Very fast reads",
          "Offloads expensive joins/aggregations",
          "Reduces load on source tables"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Extra storage",
          "Refresh strategy complexity",
          "Staleness / drift to manage"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Stale view",
            "body": "Refresh lags behind source changes and reads return old data. Detect with view-age metrics versus source update timestamps."
          },
          {
            "term": "Refresh storms",
            "body": "Eager refresh on every write overwhelms the system. Detect via refresh-rate spikes; switch to batched or scheduled refresh."
          },
          {
            "term": "Drift from source",
            "body": "A missed refresh leaves the view subtly wrong. Detect with periodic checksum comparison against recomputed results."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "DynamoDB GSI — pre-computed views · ElastiCache — cached views · Redshift materialized views"
          },
          {
            "term": "GCP",
            "body": "BigQuery materialized views · Firestore denormalized documents · Spanner materialized views"
          },
          {
            "term": "Azure",
            "body": "Cosmos DB denormalized containers · Azure SQL indexed/materialized views · Synapse materialized views"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Blue/Green Deployment": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "You need clean, all-or-nothing cutover with instant rollback.",
          "Downtime during deploys is unacceptable.",
          "You can afford to run two full environments briefly."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Near-instant rollback",
          "Zero-downtime cutover",
          "Full verification before switch"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Double infrastructure cost",
          "DB migration compatibility burden",
          "All-or-nothing (no gradual exposure)"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Incompatible DB migration",
            "body": "Schema changes break the version still reading the shared database. Detect with backward-compatible migration tests across both versions."
          },
          {
            "term": "Cost of double infrastructure",
            "body": "Running two full stacks doubles spend during the window. Detect with cost-per-deploy tracking and tight switch windows."
          },
          {
            "term": "Stale connections after switch",
            "body": "Long-lived connections linger on the old stack. Detect with connection-drain metrics and enforce draining before teardown."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "ALB target-group swap · Route 53 weighted routing · CodeDeploy / Beanstalk blue-green"
          },
          {
            "term": "GCP",
            "body": "Cloud Run traffic split · GKE service selector swap · App Engine traffic migration"
          },
          {
            "term": "Azure",
            "body": "App Service deployment slots · AKS ingress swap · Traffic Manager routing"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Canary Deployment": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "You want to catch production-only issues before full rollout.",
          "Blast radius of a bad release must stay small.",
          "You have good metrics to gate progression automatically."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Small blast radius for bad releases",
          "Catches production-only problems",
          "Automated metric-gated rollout"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Slower than instant cutover",
          "Needs strong metrics & automation",
          "Two versions coexist during rollout"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Insensitive metrics",
            "body": "Thresholds miss a real regression and the canary promotes anyway. Detect with statistically sound comparison and guardrail metrics."
          },
          {
            "term": "Low-traffic canary",
            "body": "Too little traffic to detect issues at small percentages. Detect by checking sample size before each promotion."
          },
          {
            "term": "Long-lived dual versions",
            "body": "A stalled rollout leaves two versions running indefinitely. Detect with rollout-duration alerts and automatic timeouts."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "CodeDeploy canary + Lambda weighted aliases · API Gateway canary releases · CloudWatch alarms — auto-rollback"
          },
          {
            "term": "GCP",
            "body": "Cloud Run gradual migration · GKE with Flagger · Anthos progressive delivery"
          },
          {
            "term": "Azure",
            "body": "App Service slots with % routing · Deployment Manager health checks · Front Door weighted routing"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Feature Flags Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "You want to release independently of deploy (dark launches, gradual rollout).",
          "You need an instant kill switch for a risky feature.",
          "You're running A/B experiments or per-tier gating."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Deploy decoupled from release",
          "Instant kill switch & rollback",
          "Enables trunk-based dev and A/B"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Flag debt accumulates",
          "Testing-matrix explosion",
          "Dependency on flag-service availability"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Flag debt",
            "body": "Temporary flags are never removed and clutter the codebase. Detect with flag-age reports and enforce cleanup deadlines."
          },
          {
            "term": "Flag interaction bugs",
            "body": "Combinations of flags produce untested states. Detect by tracking active-flag combinations and targeted testing."
          },
          {
            "term": "Flag-service outage",
            "body": "If evaluation fails, behavior is undefined. Detect with flag-service health checks and safe default fallbacks."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "AppConfig feature flags · CloudWatch Evidently — A/B testing · Parameter Store config"
          },
          {
            "term": "GCP",
            "body": "Firebase Remote Config · Cloud Deploy with flags · App Config management"
          },
          {
            "term": "Azure",
            "body": "App Configuration feature management · Split.io / LaunchDarkly integration · App Config filters"
          }
        ]
      }
    ]
  },
  "cloud-architecture:Sidecar Service Mesh Pattern": {
    "sections": [
      {
        "kind": "list",
        "heading": "When to use",
        "items": [
          "Many polyglot services need uniform mTLS, retries, and traffic policy.",
          "You want networking concerns governed centrally, not coded per service.",
          "Deep observability of service-to-service traffic is a requirement."
        ]
      },
      {
        "kind": "list",
        "heading": "Benefits",
        "items": [
          "Zero networking code in apps",
          "Uniform mTLS, retries, tracing",
          "Centralized traffic governance"
        ]
      },
      {
        "kind": "list",
        "heading": "Costs & trade-offs",
        "items": [
          "Added per-hop latency",
          "Significant operational complexity",
          "Control plane is critical infra"
        ]
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Control-plane outage",
            "body": "If the control plane can't push config, the mesh degrades. Detect with control-plane health and config-propagation metrics."
          },
          {
            "term": "Per-hop latency tax",
            "body": "Every call traverses two proxies, adding tail latency. Detect by comparing direct vs meshed call timing."
          },
          {
            "term": "Configuration complexity",
            "body": "Misapplied traffic rules silently break routing. Detect with config validation, canarying mesh changes, and policy linting."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Cloud implementations",
        "items": [
          {
            "term": "AWS",
            "body": "App Mesh with Envoy sidecars · ECS service mesh · X-Ray — mesh tracing"
          },
          {
            "term": "GCP",
            "body": "Anthos Service Mesh / Istio on GKE · Traffic Director — control plane · Cloud Trace integration"
          },
          {
            "term": "Azure",
            "body": "Istio add-on for AKS · Linkerd on AKS / Open Service Mesh · Azure Monitor — mesh telemetry"
          }
        ]
      }
    ]
  },
  "design-patterns:Abstract Factory": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "Your code must work with several families of related products (e.g. UI widgets for different operating systems).",
          "You want to guarantee that products from the same family are always used together.",
          "You want to hide concrete product classes and swap an entire family in one place."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Guarantees that products from one family are compatible with each other.",
          "Isolates concrete classes — clients depend only on interfaces.",
          "Swapping the entire product family happens in a single line."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Adding a brand-new kind of product forces a change to every factory.",
          "The web of interfaces and classes can be hard to follow at first."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Each factory produces a matching family of UI widgets\ninterface Button { render(): void; }\n\ninterface GUIFactory {\n  createButton(): Button; // creation method for the family\n}\n\nclass WinButton implements Button {\n  render() { console.log(\"Render a Windows button\"); }\n}\nclass MacButton implements Button {\n  render() { console.log(\"Render a macOS button\"); }\n}\n\n// Concrete factories each build one specific variant\nclass WinFactory implements GUIFactory {\n  createButton(): Button { return new WinButton(); }\n}\nclass MacFactory implements GUIFactory {\n  createButton(): Button { return new MacButton(); }\n}\n\n// Client depends only on the abstract types\nfunction renderUI(factory: GUIFactory) {\n  factory.createButton().render();\n}\n\nconst os = \"mac\";\n// Choose the family once; the rest of the code never changes\nrenderUI(os === \"mac\" ? new MacFactory() : new WinFactory());"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Kit"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Factory Method",
          "Builder",
          "Singleton"
        ]
      }
    ]
  },
  "design-patterns:Builder": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "An object needs many optional parts and a single giant constructor would be unwieldy.",
          "You want to produce different representations of an object using the same building steps.",
          "Construction must happen in a controlled, step-by-step sequence."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Lets you construct objects step by step and reuse construction code.",
          "Isolates complex assembly from the product's business logic.",
          "Produces different representations with the same building process."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Requires a separate builder class per product, adding code volume.",
          "Overkill for objects that only have a couple of fields."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// The complex product we assemble piece by piece\nclass House {\n  walls = 0;\n  doors = 0;\n  hasGarage = false;\n}\n\n// Builder exposes one method per configurable part\nclass HouseBuilder {\n  private house = new House();\n  setWalls(n: number): this { this.house.walls = n; return this; }\n  setDoors(n: number): this { this.house.doors = n; return this; }\n  addGarage(): this { this.house.hasGarage = true; return this; }\n  build(): House { return this.house; } // hand back the result\n}\n\n// Client chains the steps in whatever order it likes\nconst house = new HouseBuilder()\n  .setWalls(4)\n  .setDoors(2)\n  .addGarage()\n  .build();\n\nconsole.log(house); // House { walls: 4, doors: 2, hasGarage: true }"
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Abstract Factory",
          "Composite",
          "Factory Method"
        ]
      }
    ]
  },
  "design-patterns:Factory Method": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "A class can't anticipate the exact type of objects it must create.",
          "You want subclasses to specify the objects that get created.",
          "You want to localize creation logic so new products don't touch existing code."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Removes tight coupling between the creator and concrete products.",
          "Honors the Open/Closed Principle — add products via new subclasses.",
          "Centralizes product creation in a single overridable method."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Can require many subclasses just to vary the created product.",
          "Adds a layer of indirection that simple cases may not need."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Product interface returned by the factory method\ninterface Transport { deliver(): void; }\n\nclass Truck implements Transport {\n  deliver() { console.log(\"Deliver by land in a box\"); }\n}\nclass Ship implements Transport {\n  deliver() { console.log(\"Deliver by sea in a container\"); }\n}\n\n// Creator declares the factory method and uses the product\nabstract class Logistics {\n  abstract createTransport(): Transport; // the factory method\n  planDelivery() {\n    const t = this.createTransport(); // subclass picks the type\n    t.deliver();\n  }\n}\n\n// Subclasses choose which concrete product to build\nclass RoadLogistics extends Logistics {\n  createTransport(): Transport { return new Truck(); }\n}\nclass SeaLogistics extends Logistics {\n  createTransport(): Transport { return new Ship(); }\n}\n\nnew RoadLogistics().planDelivery(); // Deliver by land in a box\nnew SeaLogistics().planDelivery();  // Deliver by sea in a container"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Virtual Constructor"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Abstract Factory",
          "Template Method",
          "Prototype"
        ]
      }
    ]
  },
  "design-patterns:Prototype": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "Creating an object is far more expensive than copying an existing one.",
          "You want to avoid a factory hierarchy that mirrors your product classes.",
          "Objects have a few known configurations and copying a prepared instance beats rebuilding it."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Clones objects without coupling to their concrete classes.",
          "Skips costly initialization by copying a ready-made instance.",
          "Lets you produce complex pre-configured objects with ease."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Cloning objects with circular references can be tricky.",
          "Deciding between deep and shallow copies adds subtle complexity."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Prototype interface: every type knows how to copy itself\ninterface Shape {\n  clone(): Shape;\n  describe(): string;\n}\n\nclass Circle implements Shape {\n  constructor(public radius: number, public color: string) {}\n  // Return a new instance carrying the same field values\n  clone(): Shape { return new Circle(this.radius, this.color); }\n  describe(): string { return this.color + \" circle r=\" + this.radius; }\n}\n\n// Prepare an original, then stamp out copies\nconst original = new Circle(10, \"red\");\nconst copy = original.clone() as Circle;\ncopy.color = \"blue\"; // tweak only what differs\n\nconsole.log(original.describe()); // red circle r=10\nconsole.log(copy.describe());     // blue circle r=10"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Clone"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Abstract Factory",
          "Composite",
          "Memento"
        ]
      }
    ]
  },
  "design-patterns:Singleton": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "Exactly one instance of a class must coordinate actions across the system (e.g. a config or connection pool).",
          "You need stricter control over a global than a plain global variable provides.",
          "The single instance should be created lazily, on first use."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Guarantees a single instance with one well-known access point.",
          "Creates the instance lazily, only when first needed.",
          "Centralizes shared state and its initialization logic."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Acts as hidden global state, which makes unit testing harder.",
          "Can mask poor design and tight coupling between modules.",
          "Needs care to stay safe under concurrent access."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "class Database {\n  // Hold the one and only instance\n  private static instance: Database | null = null;\n  public data: string[] = [];\n\n  // Hide the constructor so no one can call \"new\" directly\n  private constructor() {}\n\n  // The single global access point\n  static getInstance(): Database {\n    if (Database.instance === null) {\n      Database.instance = new Database(); // created lazily, once\n    }\n    return Database.instance;\n  }\n}\n\nconst a = Database.getInstance();\nconst b = Database.getInstance();\na.data.push(\"row-1\");\n\nconsole.log(a === b);        // true  -> same object\nconsole.log(b.data.length);  // 1     -> shared state"
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Abstract Factory",
          "Facade",
          "Prototype"
        ]
      }
    ]
  },
  "design-patterns:Adapter": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You want to use an existing class but its interface doesn't match what your code needs.",
          "You must integrate a third-party or legacy class you cannot modify.",
          "You want to reuse several existing subclasses that lack a common interface."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Lets incompatible classes work together without touching their code.",
          "Separates interface-conversion code from business logic.",
          "You can introduce new adapters without breaking existing clients."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Adds an extra layer of indirection and a new class to maintain.",
          "Sometimes changing the service to match is simpler than adapting it."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// The interface the client already speaks\ninterface JsonLogger { log(message: string): void; }\n\n// A legacy class we cannot change, with an awkward interface\nclass XmlService {\n  writeXml(xml: string) { console.log(\"<log>\" + xml + \"</log>\"); }\n}\n\n// Adapter implements the target and wraps the adaptee\nclass XmlLoggerAdapter implements JsonLogger {\n  constructor(private service: XmlService) {}\n  log(message: string): void {\n    // translate the call into what the adaptee understands\n    this.service.writeXml(message);\n  }\n}\n\n// Client only ever knows the JsonLogger interface\nfunction run(logger: JsonLogger) { logger.log(\"hello\"); }\n\nrun(new XmlLoggerAdapter(new XmlService())); // <log>hello</log>"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Wrapper"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Bridge",
          "Decorator",
          "Facade"
        ]
      }
    ]
  },
  "design-patterns:Bridge": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You want to avoid a combinatorial explosion of subclasses when two dimensions vary (e.g. device × remote).",
          "Both the abstraction and its implementation should be extensible by subclassing independently.",
          "You want to switch implementations at runtime."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Lets abstraction and implementation vary and grow independently.",
          "Replaces a subclass explosion with two smaller hierarchies.",
          "You can swap the implementation at runtime."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Adds upfront complexity and indirection.",
          "Can be hard to apply to a cohesive class with one obvious dimension."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Implementation side: the \"how\"\ninterface Device { setVolume(percent: number): void; }\n\nclass TV implements Device {\n  setVolume(p: number) { console.log(\"TV volume -> \" + p); }\n}\nclass Radio implements Device {\n  setVolume(p: number) { console.log(\"Radio volume -> \" + p); }\n}\n\n// Abstraction side: the \"what\", delegating to a Device\nclass Remote {\n  constructor(protected device: Device) {}\n  volumeUp() { this.device.setVolume(60); }\n}\n// Refined abstraction adds behaviour, reuses any Device\nclass AdvancedRemote extends Remote {\n  mute() { this.device.setVolume(0); }\n}\n\n// Mix and match any abstraction with any implementation\nnew Remote(new TV()).volumeUp();        // TV volume -> 60\nnew AdvancedRemote(new Radio()).mute(); // Radio volume -> 0"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Handle/Body"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Adapter",
          "Abstract Factory",
          "Strategy"
        ]
      }
    ]
  },
  "design-patterns:Composite": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You need to represent a part-whole hierarchy as a tree (files/folders, UI elements, org charts).",
          "You want client code to treat single objects and groups of objects the same way.",
          "Operations should recurse naturally through the whole structure."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Lets clients treat individual and composite objects uniformly.",
          "Makes it easy to add new component types via the shared interface.",
          "Recursive tree operations become natural and concise."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "An overly general interface can make some component types awkward.",
          "Type safety suffers when leaves and composites must behave differently."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Shared interface for both files and folders\ninterface FsNode { size(): number; }\n\nclass File implements FsNode {\n  constructor(private bytes: number) {}\n  size(): number { return this.bytes; } // leaf: direct answer\n}\n\nclass Folder implements FsNode {\n  private children: FsNode[] = [];\n  add(node: FsNode) { this.children.push(node); }\n  // composite: delegate to children and combine results\n  size(): number {\n    return this.children.reduce((sum, c) => sum + c.size(), 0);\n  }\n}\n\nconst root = new Folder();\nroot.add(new File(100));\nconst sub = new Folder();\nsub.add(new File(40));\nroot.add(sub);\n\nconsole.log(root.size()); // 140 -> recurses through the tree"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Object Tree"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Decorator",
          "Iterator",
          "Visitor"
        ]
      }
    ]
  },
  "design-patterns:Decorator": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You need to add responsibilities to individual objects at runtime without affecting others.",
          "Subclassing to extend behaviour would cause an explosion of combinations.",
          "You want to add or remove features by stacking wrappers in any order."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Adds or removes responsibilities at runtime, not just at compile time.",
          "Avoids a feature-combination subclass explosion by stacking wrappers.",
          "Each decorator keeps a single, focused responsibility."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Many small wrapper objects can be hard to debug and configure.",
          "Behaviour can depend on the order decorators are applied."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Component interface\ninterface Coffee { cost(): number; }\n\n// Concrete component: plain coffee\nclass Espresso implements Coffee {\n  cost(): number { return 2; }\n}\n\n// Base decorator wraps another Coffee\nabstract class CoffeeDecorator implements Coffee {\n  constructor(protected inner: Coffee) {}\n  abstract cost(): number;\n}\n\n// Concrete decorators add their own cost on top\nclass Milk extends CoffeeDecorator {\n  cost(): number { return this.inner.cost() + 0.5; }\n}\nclass Sugar extends CoffeeDecorator {\n  cost(): number { return this.inner.cost() + 0.2; }\n}\n\n// Stack wrappers in any order you like\nlet drink: Coffee = new Espresso();\ndrink = new Milk(drink);\ndrink = new Sugar(drink);\n\nconsole.log(drink.cost()); // 2.7"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Wrapper"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Adapter",
          "Composite",
          "Strategy"
        ]
      }
    ]
  },
  "design-patterns:Facade": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You want a simple entry point into a large, complex subsystem.",
          "There are many dependencies between clients and a subsystem's implementation classes.",
          "You want to layer your subsystems and reduce coupling between them."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Shields clients from a subsystem's complexity behind a small interface.",
          "Reduces coupling between client code and many subsystem classes.",
          "Offers a convenient default path while leaving advanced access open."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "The facade can grow into a 'god object' coupled to everything.",
          "It may hide functionality that clients sometimes genuinely need."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Complex subsystem made of several independent classes\nclass VideoFile { constructor(public name: string) {} }\nclass Codec { read(f: VideoFile) { return \"raw:\" + f.name; } }\nclass Compressor { compress(raw: string) { return \"mp4:\" + raw; } }\n\n// Facade exposes one simple method over the subsystem\nclass VideoConverter {\n  private codec = new Codec();\n  private compressor = new Compressor();\n\n  // Orchestrates the whole subsystem behind a single call\n  convert(filename: string): string {\n    const file = new VideoFile(filename);\n    const raw = this.codec.read(file);\n    return this.compressor.compress(raw);\n  }\n}\n\n// Client never touches Codec or Compressor directly\nconst converter = new VideoConverter();\nconsole.log(converter.convert(\"clip.avi\")); // mp4:raw:clip.avi"
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Adapter",
          "Mediator",
          "Singleton"
        ]
      }
    ]
  },
  "design-patterns:Flyweight": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "An application must spawn a huge number of similar objects and memory is tight.",
          "Most of an object's state can be made extrinsic (passed in) rather than stored.",
          "Many objects can be replaced by a few shared ones once extrinsic state is externalized."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Drastically cuts memory use when many objects share state.",
          "Centralizes shared state, often improving cache locality.",
          "A factory ensures identical flyweights are reused, never recreated."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Trades memory for CPU time spent recomputing extrinsic state.",
          "Splitting intrinsic and extrinsic state makes the code more complex."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Flyweight stores only shared (intrinsic) state\nclass TreeType {\n  constructor(public name: string, public texture: string) {}\n  draw(x: number, y: number) { // extrinsic state passed in\n    console.log(this.name + \" at (\" + x + \",\" + y + \")\");\n  }\n}\n\n// Factory caches and reuses flyweights\nclass TreeFactory {\n  private types: Record<string, TreeType> = {};\n  get(name: string, texture: string): TreeType {\n    const key = name + texture;\n    if (!this.types[key]) this.types[key] = new TreeType(name, texture);\n    return this.types[key]; // share the same instance\n  }\n}\n\nconst factory = new TreeFactory();\nconst a = factory.get(\"Oak\", \"oak.png\");\nconst b = factory.get(\"Oak\", \"oak.png\");\na.draw(10, 20); // Oak at (10,20)\n\nconsole.log(a === b); // true -> one shared flyweight"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Cache"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Composite",
          "Singleton",
          "Factory Method"
        ]
      }
    ]
  },
  "design-patterns:Proxy": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You need lazy initialization of a heavyweight object (a virtual proxy).",
          "You need access control or permission checks before reaching the real object.",
          "You want to add logging, caching, or remote access transparently around an object."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Controls access to the real object transparently to clients.",
          "Enables lazy creation of expensive objects (load on demand).",
          "Lets you add caching, logging, or security without changing the subject."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Adds another layer that can slow down the response.",
          "Increases the number of classes and the overall complexity."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Shared interface for the real object and its proxy\ninterface Image { display(): void; }\n\n// Heavyweight real subject, loaded from disk\nclass RealImage implements Image {\n  constructor(private file: string) {\n    console.log(\"Loading \" + file); // expensive work\n  }\n  display() { console.log(\"Showing \" + this.file); }\n}\n\n// Virtual proxy delays creation until first use\nclass ImageProxy implements Image {\n  private real: RealImage | null = null;\n  constructor(private file: string) {}\n  display() {\n    if (!this.real) this.real = new RealImage(this.file); // lazy load\n    this.real.display();\n  }\n}\n\nconst img: Image = new ImageProxy(\"photo.jpg\"); // nothing loaded yet\nimg.display(); // Loading photo.jpg  /  Showing photo.jpg\nimg.display(); // Showing photo.jpg (already loaded)"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Surrogate"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Adapter",
          "Decorator",
          "Facade"
        ]
      }
    ]
  },
  "design-patterns:Chain of Responsibility": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "More than one object may handle a request and the handler isn't known in advance.",
          "You want to issue a request to one of several objects without coupling sender to receiver.",
          "The set of handlers and their order should be configurable at runtime."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Decouples the sender of a request from its receivers.",
          "Lets you add or reorder handlers without changing client code.",
          "Each handler keeps a single, focused responsibility."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "A request can fall off the end of the chain unhandled.",
          "Debugging is harder when it's unclear which handler responded."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Base handler keeps a link to the next handler\nabstract class Approver {\n  protected next: Approver | null = null;\n  setNext(a: Approver): Approver { this.next = a; return a; }\n  handle(amount: number): void {\n    if (this.next) this.next.handle(amount); // pass it along\n  }\n}\n\n// Concrete handlers decide whether to act or forward\nclass Manager extends Approver {\n  handle(amount: number) {\n    if (amount <= 1000) console.log(\"Manager approved \" + amount);\n    else super.handle(amount);\n  }\n}\nclass Director extends Approver {\n  handle(amount: number) {\n    if (amount <= 10000) console.log(\"Director approved \" + amount);\n    else super.handle(amount);\n  }\n}\n\nconst chain = new Manager();\nchain.setNext(new Director());\nchain.handle(500);  // Manager approved 500\nchain.handle(8000); // Director approved 8000"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Chain of Command"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Command",
          "Composite",
          "Decorator"
        ]
      }
    ]
  },
  "design-patterns:Command": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You want to parameterize objects with operations, or queue and schedule requests.",
          "You need to support undo/redo or logging of operations.",
          "You want to decouple the object that invokes an operation from the one that performs it."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Decouples the invoker from the object that performs the work.",
          "Lets you queue, log, schedule, and undo/redo operations.",
          "New commands can be added without changing existing code."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Introduces a small command class for every distinct action.",
          "Can be overkill when a simple direct call would do."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Command interface: every request becomes an object\ninterface Command { execute(): void; }\n\n// Receiver knows how to perform the real work\nclass Light {\n  on() { console.log(\"Light is on\"); }\n  off() { console.log(\"Light is off\"); }\n}\n\n// Concrete command binds a receiver to an action\nclass TurnOn implements Command {\n  constructor(private light: Light) {}\n  execute() { this.light.on(); }\n}\n\n// Invoker triggers commands without knowing the details\nclass Remote {\n  private queue: Command[] = [];\n  submit(cmd: Command) { this.queue.push(cmd); }\n  run() { this.queue.forEach((c) => c.execute()); }\n}\n\nconst remote = new Remote();\nremote.submit(new TurnOn(new Light()));\nremote.run(); // Light is on"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Action",
          "Transaction"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Chain of Responsibility",
          "Memento",
          "Strategy"
        ]
      }
    ]
  },
  "design-patterns:Interpreter": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You have a simple, well-defined language or notation to evaluate (math, rules, queries).",
          "The grammar is small and stable enough to map each rule to a class.",
          "Clarity of the grammar matters more than raw execution speed."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Each grammar rule maps cleanly to its own class.",
          "Easy to extend the language by adding new expression classes.",
          "The grammar's structure is made explicit in the code."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Grows unwieldy for languages with many grammar rules.",
          "Usually slower and clunkier than a real parser or compiler."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Shared context for interpreting an expression tree\ntype Context = Record<string, number>;\n\ninterface Expression { interpret(ctx: Context): number; }\n\n// Terminal expression: a variable lookup\nclass Variable implements Expression {\n  constructor(private name: string) {}\n  interpret(ctx: Context): number { return ctx[this.name]; }\n}\n\n// Non-terminal expression: combines sub-expressions\nclass Add implements Expression {\n  constructor(private left: Expression, private right: Expression) {}\n  interpret(ctx: Context): number {\n    return this.left.interpret(ctx) + this.right.interpret(ctx);\n  }\n}\n\n// \"x + y\" becomes a tree of expression objects\nconst expr = new Add(new Variable(\"x\"), new Variable(\"y\"));\nconsole.log(expr.interpret({ x: 3, y: 5 })); // 8"
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Composite",
          "Iterator",
          "Visitor"
        ]
      }
    ]
  },
  "design-patterns:Iterator": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You want to traverse a collection without exposing its internal structure.",
          "You need multiple or simultaneous traversals over the same collection.",
          "You want a uniform traversal interface across different collection types."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Lets you traverse a collection without exposing its internals.",
          "Supports several independent traversals at the same time.",
          "Gives a uniform interface across different collection types."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Overkill for simple collections you could just loop over directly.",
          "An extra object per traversal adds a little overhead."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Iterator interface: sequential access\ninterface Iterator<T> {\n  hasNext(): boolean;\n  next(): T;\n}\n\n// Aggregate exposes a factory for its iterator\nclass NameList {\n  private names: string[] = [];\n  add(name: string) { this.names.push(name); }\n  createIterator(): Iterator<string> {\n    let index = 0;\n    const names = this.names;\n    return {\n      hasNext: () => index < names.length,\n      next: () => names[index++],\n    };\n  }\n}\n\nconst list = new NameList();\nlist.add(\"Ann\");\nlist.add(\"Bob\");\nconst it = list.createIterator();\nwhile (it.hasNext()) console.log(it.next()); // Ann, Bob"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Cursor"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Composite",
          "Factory Method",
          "Visitor"
        ]
      }
    ]
  },
  "design-patterns:Mediator": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "A set of objects communicate in complex, tangled ways that are hard to follow.",
          "Reusing a component is hard because it depends on many others.",
          "You want to centralize control logic that's currently spread across several classes."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Reduces a tangle of many-to-many dependencies to a hub and spokes.",
          "Centralizes interaction logic in a single place.",
          "Makes the individual components easier to reuse."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "The mediator can grow into a complex 'god object'.",
          "Centralizing too much logic can turn it into a bottleneck."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Mediator coordinates communication between components\ninterface Mediator { notify(sender: string, event: string): void; }\n\n// Components talk to the mediator, never to each other\nclass Button {\n  constructor(private mediator: Mediator) {}\n  click() { this.mediator.notify(\"button\", \"click\"); }\n}\nclass TextBox {\n  enabled = false;\n  enable() { this.enabled = true; console.log(\"TextBox enabled\"); }\n}\n\n// Concrete mediator wires the components together\nclass Dialog implements Mediator {\n  constructor(private box: TextBox) {}\n  notify(sender: string, event: string) {\n    if (sender === \"button\" && event === \"click\") this.box.enable();\n  }\n}\n\nconst box = new TextBox();\nconst dialog = new Dialog(box);\nnew Button(dialog).click(); // TextBox enabled"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Intermediary"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Facade",
          "Observer",
          "Command"
        ]
      }
    ]
  },
  "design-patterns:Memento": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You need to capture snapshots of an object's state to support undo or rollback.",
          "Direct access to the object's fields would break its encapsulation.",
          "You want to save and restore state without exposing implementation details."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Captures and restores state without breaking encapsulation.",
          "Simplifies the originator by offloading state history to a caretaker.",
          "Provides a clean foundation for undo and redo."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Storing many mementos can consume a lot of memory.",
          "Caretakers must manage the lifecycle of the stored mementos."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Memento stores a snapshot, opaque to outsiders\nclass Memento {\n  constructor(public readonly state: string) {}\n}\n\n// Originator creates and restores from mementos\nclass Editor {\n  private content = \"\";\n  type(text: string) { this.content += text; }\n  save(): Memento { return new Memento(this.content); }\n  restore(m: Memento) { this.content = m.state; }\n  toString() { return this.content; }\n}\n\n// Caretaker keeps a history but never reads the state\nclass History {\n  private stack: Memento[] = [];\n  push(m: Memento) { this.stack.push(m); }\n  pop(): Memento { return this.stack.pop()!; }\n}\n\nconst editor = new Editor();\nconst history = new History();\neditor.type(\"hello\");\nhistory.push(editor.save()); // checkpoint\neditor.type(\" world\");\neditor.restore(history.pop());\nconsole.log(editor.toString()); // hello"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Snapshot",
          "Token"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Command",
          "Prototype",
          "State"
        ]
      }
    ]
  },
  "design-patterns:Observer": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "A change to one object requires changing others, and you don't know how many.",
          "An object should notify other objects without assuming who they are.",
          "You want loose coupling between a subject and its dependents."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Loosely couples the subject from its observers.",
          "You can add or remove observers at runtime.",
          "Supports broadcast communication to many listeners at once."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Observers are notified in an unpredictable order.",
          "Careless subscriptions can cause memory leaks or update storms."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Observer interface: receives updates\ninterface Observer { update(temp: number): void; }\n\n// Subject keeps a list of observers and notifies them\nclass WeatherStation {\n  private observers: Observer[] = [];\n  subscribe(o: Observer) { this.observers.push(o); }\n  setTemperature(t: number) {\n    this.observers.forEach((o) => o.update(t)); // broadcast\n  }\n}\n\n// Concrete observers react to the notification\nclass PhoneDisplay implements Observer {\n  update(temp: number) { console.log(\"Phone shows \" + temp); }\n}\nclass WindowDisplay implements Observer {\n  update(temp: number) { console.log(\"Window shows \" + temp); }\n}\n\nconst station = new WeatherStation();\nstation.subscribe(new PhoneDisplay());\nstation.subscribe(new WindowDisplay());\nstation.setTemperature(22); // Phone shows 22 / Window shows 22"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Publish-Subscribe",
          "Dependents"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Mediator",
          "Command",
          "Chain of Responsibility"
        ]
      }
    ]
  },
  "design-patterns:State": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "An object's behaviour depends on its state and must change at runtime.",
          "Operations have large multipart conditionals that depend on the object's state.",
          "State transitions should be explicit and localized rather than scattered."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Localizes state-specific behaviour in dedicated classes.",
          "Makes state transitions explicit and easy to follow.",
          "Removes large conditional statements from the context."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Adds a class per state, which can be excessive for just a few states.",
          "State objects often need references to each other to transition."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// State interface: behaviour for one mode\ninterface State { handle(light: TrafficLight): void; }\n\n// Context delegates to its current state\nclass TrafficLight {\n  constructor(public state: State) {}\n  change() { this.state.handle(this); } // behaviour varies by state\n}\n\n// Each concrete state acts and picks the next state\nclass Red implements State {\n  handle(light: TrafficLight) {\n    console.log(\"Stop\");\n    light.state = new Green();\n  }\n}\nclass Green implements State {\n  handle(light: TrafficLight) {\n    console.log(\"Go\");\n    light.state = new Red();\n  }\n}\n\nconst light = new TrafficLight(new Red());\nlight.change(); // Stop  (now Green)\nlight.change(); // Go    (now Red)"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Objects for States"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Strategy",
          "Memento",
          "Singleton"
        ]
      }
    ]
  },
  "design-patterns:Strategy": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You have several variants of an algorithm and want to switch between them.",
          "You want to avoid exposing complex, algorithm-specific data structures.",
          "A class has many behaviours selected by conditionals that you want to remove."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Swaps algorithms at runtime through a common interface.",
          "Isolates each algorithm's code and data from the others.",
          "Replaces conditional logic with interchangeable objects."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Clients must understand the differences to choose a strategy.",
          "Adds objects and indirection for what may be simple variations."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Strategy interface: one interchangeable algorithm\ninterface PayStrategy { pay(amount: number): void; }\n\nclass CreditCard implements PayStrategy {\n  pay(a: number) { console.log(\"Paid \" + a + \" by credit card\"); }\n}\nclass PayPal implements PayStrategy {\n  pay(a: number) { console.log(\"Paid \" + a + \" via PayPal\"); }\n}\n\n// Context delegates the work to whatever strategy it holds\nclass Checkout {\n  constructor(private strategy: PayStrategy) {}\n  setStrategy(s: PayStrategy) { this.strategy = s; }\n  confirm(amount: number) { this.strategy.pay(amount); }\n}\n\nconst checkout = new Checkout(new CreditCard());\ncheckout.confirm(50);               // Paid 50 by credit card\ncheckout.setStrategy(new PayPal());\ncheckout.confirm(20);               // Paid 20 via PayPal"
      },
      {
        "kind": "list",
        "heading": "Also known as",
        "items": [
          "Policy"
        ]
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "State",
          "Bridge",
          "Template Method"
        ]
      }
    ]
  },
  "design-patterns:Template Method": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "Several classes share an algorithm that differs only in certain steps.",
          "You want to localize common behaviour and let subclasses fill in the variations.",
          "You want to control which parts of an algorithm subclasses may extend."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Removes duplication by hoisting shared steps into the base class.",
          "Lets subclasses customize only the parts that genuinely vary.",
          "Keeps the overall algorithm structure fixed and consistent."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "The fixed skeleton can feel restrictive for unusual cases.",
          "Changes to the base algorithm can ripple into every subclass."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Base class defines the fixed algorithm skeleton\nabstract class Beverage {\n  // Template method: the steps never change order\n  prepare(): void {\n    this.boilWater();\n    this.brew();       // step varies by subclass\n    this.pourInCup();\n  }\n  private boilWater() { console.log(\"Boiling water\"); }\n  private pourInCup() { console.log(\"Pouring into cup\"); }\n  protected abstract brew(): void; // subclasses fill this in\n}\n\nclass Tea extends Beverage {\n  protected brew() { console.log(\"Steeping the tea\"); }\n}\nclass Coffee extends Beverage {\n  protected brew() { console.log(\"Dripping the coffee\"); }\n}\n\nnew Tea().prepare();    // Boiling water / Steeping tea / Pouring\nnew Coffee().prepare(); // Boiling water / Dripping coffee / Pouring"
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Factory Method",
          "Strategy",
          "Bridge"
        ]
      }
    ]
  },
  "design-patterns:Visitor": {
    "sections": [
      {
        "kind": "list",
        "heading": "Use when",
        "items": [
          "You need to perform many unrelated operations across an object structure.",
          "The object classes are stable but the operations on them change often.",
          "You want to keep related operations together rather than spread across classes."
        ]
      },
      {
        "kind": "list",
        "heading": "Pros",
        "items": [
          "Adds new operations without modifying the element classes.",
          "Groups related behaviour for all element types in one visitor.",
          "Can accumulate state across the elements it visits."
        ]
      },
      {
        "kind": "list",
        "heading": "Cons",
        "items": [
          "Adding a new element type forces a change to every visitor.",
          "Visitors may need access to elements' internals, weakening encapsulation."
        ]
      },
      {
        "kind": "code",
        "heading": "Example",
        "code": "// Visitor declares a visit method per element type\ninterface Visitor {\n  visitBook(b: Book): void;\n  visitFood(f: Food): void;\n}\n\n// Elements accept a visitor and dispatch to the right method\ninterface Item { accept(v: Visitor): void; }\n\nclass Book implements Item {\n  price = 20;\n  accept(v: Visitor) { v.visitBook(this); } // double dispatch\n}\nclass Food implements Item {\n  price = 8;\n  accept(v: Visitor) { v.visitFood(this); }\n}\n\n// A new operation = a new visitor; elements stay untouched\nclass TaxVisitor implements Visitor {\n  visitBook(b: Book) { console.log(\"Book tax: \" + b.price * 0); }\n  visitFood(f: Food) { console.log(\"Food tax: \" + f.price * 0.1); }\n}\n\nconst items: Item[] = [new Book(), new Food()];\nconst tax = new TaxVisitor();\nitems.forEach((i) => i.accept(tax)); // Book tax: 0 / Food tax: 0.8"
      },
      {
        "kind": "list",
        "heading": "Related patterns",
        "items": [
          "Composite",
          "Iterator",
          "Interpreter"
        ]
      }
    ]
  },
  "postgres-internals:How a Query Travels Through Postgres": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "SQL text is a wish; the parse tree is the wish made precise, the plan is the strategy for granting it, and the executor is the genie that actually fetches the rows."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Parse-error storms",
            "body": "App latency spikes with bursts of “syntax error at or near” in logs. Cause: Dynamically concatenated SQL produces malformed statements that die in the parser before planning ever happens. Fix: Use parameterized / prepared statements so the grammar is fixed and only values vary."
          },
          {
            "term": "Planning time dominates execution",
            "body": "Trivial queries are slow and backends burn CPU before returning anything. Cause: Huge IN-lists or many joins exceeding join_collapse_limit make the planner explode combinatorially. Fix: Rewrite IN-lists as = ANY(array), reduce joined tables, and reuse prepared statements (generic plans)."
          },
          {
            "term": "View-expansion blowup",
            "body": "Querying a nested view is far slower than the referenced tables would suggest. Cause: The rewriter inlines views recursively, so nested views flatten into an enormous query the planner struggles with. Fix: Materialize the hot view or flatten the nesting; check EXPLAIN for far more scan nodes than tables you named."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Show the plan tree the planner produced for a query, without running it:\nEXPLAIN (VERBOSE) SELECT * FROM orders WHERE user_id = 42;\n\n-- Compare time spent planning vs executing, per normalized query:\nSELECT query, calls, mean_plan_time, mean_exec_time\nFROM pg_stat_statements\nORDER BY mean_exec_time DESC LIMIT 5;\n\n-- Log the chosen plan for every executed statement:\nLOAD 'auto_explain';\nSET auto_explain.log_min_duration = 0;"
      }
    ]
  },
  "postgres-internals:The Postgres Process Architecture": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Think of an open-plan office: the postmaster is the receptionist who never does the work but gives each visitor their own desk (a backend), and shared memory is the one whiteboard everyone reads and writes under strict turn-taking rules."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Connection exhaustion",
            "body": "New sessions fail with “sorry, too many clients already.” Cause: Each connection is a process; reaching max_connections blocks new ones, and even idle connections hold memory and a ProcArray slot. Fix: Put PgBouncer in transaction-pooling mode in front and cap application pool sizes."
          },
          {
            "term": "Backend crash → full restart",
            "body": "Every session disconnects at once with “the database system is in recovery mode.” Cause: One backend hit a PANIC/segfault; the postmaster kills all children and runs crash recovery to guarantee shared-memory integrity. Fix: Find the offending query or extension in the log — the cluster-wide restart is the isolation model working as intended."
          },
          {
            "term": "Runaway autovacuum workers",
            "body": "CPU and I/O spike with many ‘autovacuum worker’ rows in pg_stat_activity. Cause: Several large tables cross their thresholds together while autovacuum_max_workers is set high. Fix: Tune autovacuum_vacuum_cost_limit and stagger maintenance; investigate why so many tables aged at once."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- List every process — backends plus checkpointer, walwriter, autovacuum:\nSELECT pid, backend_type, state, query\nFROM pg_stat_activity\nORDER BY backend_type;\n\n-- The knobs that size the process fleet and shared memory:\nSELECT name, setting FROM pg_settings\nWHERE name IN ('max_connections','shared_buffers','autovacuum_max_workers');\n\n-- Background writer / checkpointer activity counters:\nSELECT * FROM pg_stat_bgwriter;"
      }
    ]
  },
  "postgres-internals:How Tables Are Stored on Disk — The Heap": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "A heap page is a parking lot where cars (tuples) park bottom-up while a numbered directory (line pointers) fills top-down; you never repaint a car, you park a new one and cross the old number off the directory."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Table bloat from churny updates",
            "body": "The table file keeps growing while the live row count stays flat, and scans slow down. Cause: Every UPDATE leaves a dead tuple; if VACUUM can't keep pace, dead versions pile up inside the pages. Fix: Make autovacuum more aggressive, lower fillfactor to enable HOT updates, and avoid updating indexed columns."
          },
          {
            "term": "ctid assumptions in app code",
            "body": "Application caches a ctid and later reads the wrong row or none at all. Cause: ctid is a physical address that changes on UPDATE and VACUUM FULL — it is not a stable identifier. Fix: Always key on a real primary key, never on the system ctid column."
          },
          {
            "term": "Free-space-map staleness",
            "body": "Inserts grow the file even though vacuumed pages have room. Cause: The free space map didn't reflect reclaimable space, so inserts append new pages instead of reusing gaps. Fix: Run VACUUM (which rebuilds the FSM); VACUUM FULL or pg_repack to physically compact."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Peek at the hidden system columns — physical location and MVCC stamps:\nSELECT ctid, xmin, xmax, * FROM orders LIMIT 5;\n\n-- Decode every line pointer and tuple header on page 0:\nCREATE EXTENSION pageinspect;\nSELECT * FROM heap_page_items(get_raw_page('orders', 0));\n\n-- Physical bytes the heap occupies on disk:\nSELECT pg_size_pretty(pg_relation_size('orders'));"
      }
    ]
  },
  "postgres-internals:B-Tree Indexes — The Data Structure": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "A B-tree is a library: the root and internal pages are the floor-and-shelf signs that get you to the right shelf in two or three glances, and the leaves are the shelf itself — a single sorted row of cards you can read straight along for a range scan."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Index ignored for low selectivity",
            "body": "Planner picks a sequential scan even though a perfectly good index exists. Cause: The predicate matches a large fraction of rows, so random heap fetches through the index cost more than reading sequentially (governed by random_page_cost). Fix: This is usually correct; if you truly need the index, make it covering for an index-only scan, or lower random_page_cost on SSD."
          },
          {
            "term": "Bloated B-tree from deletes",
            "body": "Index size grows and scans slow over time on a heavily updated table. Cause: Deleted leaf entries leave half-empty pages that don't automatically merge back. Fix: REINDEX CONCURRENTLY to rebuild the index without locking out writes."
          },
          {
            "term": "Index on a low-cardinality column",
            "body": "A large index is created but pg_stat_user_indexes shows it's almost never scanned. Cause: A B-tree on a boolean or few-value column has poor selectivity, so the planner avoids it. Fix: Drop it, or replace it with a partial index targeting the rare values you actually query."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Has the index ever actually been used?\nSELECT indexrelname, idx_scan, idx_tup_read\nFROM pg_stat_user_indexes WHERE relname = 'orders';\n\n-- Inspect the B-tree meta page — root block and tree height:\nCREATE EXTENSION pageinspect;\nSELECT * FROM bt_metap('orders_pkey');\n\n-- Size of each index on a table:\nSELECT indexrelid::regclass,\n       pg_size_pretty(pg_relation_size(indexrelid))\nFROM pg_index WHERE indrelid = 'orders'::regclass;"
      }
    ]
  },
  "postgres-internals:B-Tree Index Operations — Insert, Split, Scan": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Inserting into a B-tree is like filing a card into a full drawer: you split the drawer in two and add a new label to the cabinet above; if that cabinet is full you split it too, and only when the very top cabinet splits does the filing system grow one level taller."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Right-edge insert contention",
            "body": "Lock/buffer contention on an index over a serial or timestamp column under heavy insert load. Cause: Monotonically increasing keys all land on the same rightmost leaf, splitting it repeatedly. Fix: Accept it (recent PG optimizes rightmost splits), or distribute keys; watch LWLock buffer waits on the index."
          },
          {
            "term": "Split-driven write amplification",
            "body": "WAL volume spikes during a bulk insert into an indexed table. Cause: Random insertion order causes many leaf splits, each fully WAL-logged. Fix: Load data in key order, or drop and rebuild the index after the bulk load."
          },
          {
            "term": "Index-only scan still hitting the heap",
            "body": "EXPLAIN shows an Index Only Scan but with a high “Heap Fetches” count. Cause: The visibility map isn't all-visible for those pages because VACUUM hasn't run recently. Fix: VACUUM the table so the visibility map bits are set and the heap can be skipped."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Confirm an index-only scan and watch the Heap Fetches line:\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT id FROM orders WHERE id BETWEEN 100 AND 200;\n\n-- Live/dead items and free space on a specific leaf page:\nSELECT * FROM bt_page_stats('orders_pkey', 1);  -- pageinspect\n\n-- Tuples read from index vs fetched from heap, per index:\nSELECT relname, idx_scan, idx_tup_read, idx_tup_fetch\nFROM pg_stat_user_indexes;"
      }
    ]
  },
  "postgres-internals:Other Index Types": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "If B-tree is a sorted phone book, then Hash is a coat-check ticket, GIN is the index-of-terms in the back of a book, GiST is a set of nested map regions, and BRIN is the chapter range printed on a book's spine."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "GIN slow writes / pending-list bloat",
            "body": "Inserts into a jsonb or tsvector column slow down; some lookups scan a large pending list. Cause: GIN buffers new entries in a pending list flushed by (auto)vacuum. Fix: Lower gin_pending_list_limit or set fastupdate=off, and ensure the table is vacuumed regularly."
          },
          {
            "term": "BRIN useless after random writes",
            "body": "A BRIN index yields no speedup at all. Cause: The column lost physical correlation (rows inserted/updated out of order), so block-range summaries overlap and nothing can be skipped. Fix: Use a B-tree, or restore physical order with CLUSTER / pg_repack; check correlation in pg_stats."
          },
          {
            "term": "Hash index on a range query",
            "body": "A query with < or > ignores the hash index and seq-scans. Cause: Hash indexes support only equality. Fix: Use a B-tree for any range or ordering predicate."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- List the installed access methods on this server:\nSELECT amname FROM pg_am;\n\n-- See how tiny a BRIN index is compared to a B-tree:\nCREATE INDEX ON events USING brin (created_at);\nSELECT pg_size_pretty(pg_relation_size('events_created_at_idx'));\n\n-- Usage counts for your GIN indexes:\nSELECT indexrelname, idx_scan\nFROM pg_stat_user_indexes WHERE indexrelname LIKE '%gin%';"
      }
    ]
  },
  "postgres-internals:Transactions and ACID": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "ACID is a relay team, not a single sprinter: MVCC carries atomicity and isolation, the constraint system carries consistency, and the WAL anchors durability — drop any one runner and the whole guarantee falls."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Long idle-in-transaction sessions",
            "body": "Bloat grows and VACUUM can't clean dead tuples even on quiet tables. Cause: An open transaction holds an old snapshot/xmin, so dead versions are still considered potentially visible. Fix: Set idle_in_transaction_session_timeout and fix the app to commit promptly; watch backend_xmin in pg_stat_activity."
          },
          {
            "term": "Deferred constraint surprises",
            "body": "Application errors arrive at COMMIT rather than at the offending statement. Cause: DEFERRABLE constraints are checked at commit time, not when the row is written. Fix: Understand the deferral semantics and validate earlier in the transaction if you want fail-fast behavior."
          },
          {
            "term": "XID burn from tiny transactions",
            "body": "Rapid xid consumption and frequent anti-wraparound vacuums. Cause: Every writing transaction consumes an xid; very high transaction rates approach wraparound faster. Fix: Batch small writes and make sure autovacuum's freezing keeps pace; monitor age(datfrozenxid)."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- The current transaction id counter (64-bit extended form):\nSELECT txid_current();\n\n-- How close each database is to wraparound trouble:\nSELECT datname, age(datfrozenxid)\nFROM pg_database ORDER BY age(datfrozenxid) DESC;\n\n-- Transactions holding old snapshots right now:\nSELECT pid, state, xact_start, backend_xmin\nFROM pg_stat_activity WHERE state LIKE '%transaction%';"
      }
    ]
  },
  "postgres-internals:MVCC — Multi-Version Concurrency Control": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "MVCC is a museum that never repaints a canvas: it hangs a fresh copy with a dated tag and leaves the old ones up, so each visitor sees the gallery as it stood the day their ticket was issued."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Snapshot held open by a long transaction",
            "body": "Dead tuples pile up and VACUUM reports millions of rows it cannot remove. Cause: An old snapshot (often idle-in-transaction) means even ancient versions might still be visible to it, so VACUUM must keep them. Fix: Find the culprit via backend_xmin in pg_stat_activity, terminate it, and set idle_in_transaction_session_timeout."
          },
          {
            "term": "Hint-bit write storm after bulk load",
            "body": "The first SELECT over freshly inserted data is unexpectedly slow and write-heavy. Cause: Tuples lack hint bits, so the first reader checks clog and dirties pages to cache the result. Fix: Run VACUUM (or let autovacuum) settle hint bits proactively after large loads."
          },
          {
            "term": "Update-heavy table bloat",
            "body": "A small hot table grows to many gigabytes despite a stable row count. Cause: Every UPDATE creates a new version; if autovacuum can't keep pace the dead versions accumulate. Fix: Tune autovacuum to be more aggressive on that table and consider HOT-update-friendly fillfactor."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- See the hidden version stamps on any table's rows:\nSELECT xmin, xmax, ctid, *\nFROM orders LIMIT 5;\n\n-- Count dead vs live tuples per table:\nSELECT relname, n_live_tup, n_dead_tup\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC;\n\n-- The oldest snapshot any backend is pinning:\nSELECT pid, backend_xmin, state\nFROM pg_stat_activity\nWHERE backend_xmin IS NOT NULL;"
      }
    ]
  },
  "postgres-internals:Isolation Levels and Anomalies": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "An isolation level is how often you blink: Read Committed re-opens your eyes before every statement, Repeatable Read keeps them fixed on one frozen photo, and Serializable also checks that nobody rearranged the room while everyone's eyes were closed."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Assuming Read Committed gives stable reads",
            "body": "A sum computed across two queries in one transaction doesn't add up. Cause: Read Committed re-snapshots per statement, so a concurrent commit changes what the second query sees. Fix: Use Repeatable Read for multi-statement consistency, or take all values in a single statement."
          },
          {
            "term": "Unhandled serialization failures",
            "body": "Under Serializable, transactions intermittently fail with SQLSTATE 40001. Cause: SSI aborts a transaction whose interleaving could break serial order — this is expected, not a bug. Fix: Wrap Serializable transactions in retry logic that re-runs on 40001 errors."
          },
          {
            "term": "Write skew under Repeatable Read",
            "body": "An invariant like 'at least one row must remain' is silently violated. Cause: Repeatable Read stops phantoms but not write skew across disjoint rows. Fix: Promote to Serializable, or take an explicit lock (SELECT ... FOR UPDATE) on the guarding rows."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Check and set the isolation level of the current transaction:\nSHOW transaction_isolation;\nBEGIN ISOLATION LEVEL REPEATABLE READ;\n\n-- Count serialization failures the server has seen:\nSELECT datname, conflicts\nFROM pg_stat_database WHERE datname = current_database();\n\n-- Demonstrate a stable snapshot across statements:\nBEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT count(*) FROM orders;\n-- run again later in the same txn: identical result"
      }
    ]
  },
  "postgres-internals:Locking — Row Locks, Table Locks, Deadlocks": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Locks are the signs on shared office doors — most people only need 'reading, please knock,' a few need 'do not enter,' and when two colleagues each refuse to leave until the other does, the facilities manager (the detector) simply ejects one of them."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "ALTER TABLE stalls the whole table",
            "body": "A quick DDL hangs and a queue of ordinary queries piles up behind it. Cause: Most ALTER TABLE forms take ACCESS EXCLUSIVE, which conflicts with the ACCESS SHARE every SELECT holds — and queued requests block newcomers too. Fix: Run DDL with a short lock_timeout, in low-traffic windows, and prefer online-safe forms (e.g. ADD COLUMN without volatile default)."
          },
          {
            "term": "Frequent deadlocks under concurrency",
            "body": "Transactions intermittently abort with 'deadlock detected'. Cause: Two code paths lock the same rows in different orders, forming a cycle. Fix: Acquire locks in a consistent global order and add retry logic; inspect the detail in the server log."
          },
          {
            "term": "Lock pile-up behind a long transaction",
            "body": "Throughput collapses and pg_stat_activity shows many sessions in 'Lock' wait. Cause: A long-running transaction holds a conflicting lock and everyone queues behind it. Fix: Identify blockers with pg_blocking_pids() and keep write transactions short."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Locks currently held or awaited, with grant status:\nSELECT relation::regclass, mode, granted, pid\nFROM pg_locks WHERE NOT granted;\n\n-- Who is blocking whom, right now:\nSELECT pid, pg_blocking_pids(pid) AS blocked_by, query\nFROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0;\n\n-- Take and release an application-level advisory lock:\nSELECT pg_advisory_lock(42);\nSELECT pg_advisory_unlock(42);"
      }
    ]
  },
  "postgres-internals:WAL — The Write-Ahead Log": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "WAL is a ship captain's logbook: the captain writes down every action the instant it's decided, so even if the ship is damaged the crew can reconstruct exactly what happened by reading the log forward from the last known-good entry."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "synchronous_commit=off data loss",
            "body": "After a crash, the last fraction of a second of 'committed' transactions are gone. Cause: With async commit, COMMIT returns before the WAL fsync completes, so recent records can be lost. Fix: Use the default synchronous_commit=on for data you cannot lose; reserve off for tolerant workloads."
          },
          {
            "term": "pg_wal fills the disk",
            "body": "The server stops accepting writes; the data directory is full of WAL segments. Cause: An inactive replication slot or archiver failure prevents old segments from being recycled. Fix: Drop or advance the stuck slot, fix archive_command, and cap retention with max_slot_wal_keep_size."
          },
          {
            "term": "fsync turned off in production",
            "body": "Great write throughput, then total corruption after an unclean shutdown. Cause: fsync=off lets the OS reorder/lose writes, breaking the write-ahead ordering guarantee. Fix: Never run production with fsync=off; if I/O is the bottleneck, batch commits or use faster storage."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Current WAL write position (LSN) on the primary:\nSELECT pg_current_wal_lsn();\n\n-- How much WAL a workload generates between two samples:\nSELECT pg_size_pretty(\n  pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0'));\n\n-- WAL-related settings in effect:\nSELECT name, setting FROM pg_settings\nWHERE name IN ('wal_level','synchronous_commit','max_wal_size');"
      }
    ]
  },
  "postgres-internals:Checkpoints": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "A checkpoint is a video-game save point: dying still costs you the progress since the last save, so you save often enough that re-doing the lost stretch is quick — but not so often that saving itself becomes the chore."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Checkpoint I/O spikes",
            "body": "Periodic latency stalls every few minutes correlated with disk write bursts. Cause: Too much dirty data is flushed at once when a checkpoint fires. Fix: Raise max_wal_size and set checkpoint_completion_target near 0.9 to spread the writes."
          },
          {
            "term": "Painfully long crash recovery",
            "body": "After a crash the database takes many minutes to come back up. Cause: Checkpoints are too infrequent, so there's a huge span of WAL to replay. Fix: Lower checkpoint_timeout / max_wal_size to bound recovery time, accepting more steady-state I/O."
          },
          {
            "term": "Full-page-image WAL bloat",
            "body": "WAL volume balloons right after each checkpoint. Cause: The first write to a page after a checkpoint logs a full-page image; frequent checkpoints multiply these. Fix: Make checkpoints less frequent and consider wal_compression to shrink full-page images."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Checkpoint activity counters (PG17+ view):\nSELECT num_timed, num_requested, write_time, sync_time\nFROM pg_stat_checkpointer;\n\n-- The checkpoint position recovery would start from:\nSELECT checkpoint_lsn, redo_lsn\nFROM pg_control_checkpoint();\n\n-- Checkpoint tuning settings:\nSELECT name, setting FROM pg_settings\nWHERE name LIKE 'checkpoint%' OR name = 'max_wal_size';"
      }
    ]
  },
  "postgres-internals:Replication — Streaming and Logical": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Physical replication is a photocopier making an exact duplicate page by page; logical replication is a translator who reads the original and re-dictates its meaning into another room — same source, but one copies bytes and the other copies intent."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Runaway WAL from an orphaned slot",
            "body": "pg_wal grows without bound long after a replica was decommissioned. Cause: Its replication slot still exists and pins every segment since the slot's confirmed LSN. Fix: Drop unused slots with pg_drop_replication_slot() and monitor pg_replication_slots."
          },
          {
            "term": "Synchronous replica stalls the primary",
            "body": "Commits hang on the primary when the standby goes away. Cause: synchronous_commit=remote_apply/on with a required sync standby waits forever for an ack. Fix: Use multiple sync standbys (quorum) or relax the sync requirement so a single failure can't block commits."
          },
          {
            "term": "Silent logical replication divergence",
            "body": "Subscriber row counts drift from the publisher over time. Cause: Conflicts (e.g. duplicate keys) or an unreplicated DDL change broke apply on the subscriber. Fix: Check subscriber logs and pg_stat_subscription; logical replication does not replicate DDL automatically."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Connected standbys and their lag in bytes:\nSELECT application_name, state,\n  pg_wal_lsn_diff(sent_lsn, replay_lsn) AS replay_lag\nFROM pg_stat_replication;\n\n-- Replication slots and the WAL they are retaining:\nSELECT slot_name, active,\n  pg_size_pretty(pg_wal_lsn_diff(\n    pg_current_wal_lsn(), restart_lsn)) AS retained\nFROM pg_replication_slots;\n\n-- Am I a primary or a standby right now?\nSELECT pg_is_in_recovery();"
      }
    ]
  },
  "postgres-internals:The Buffer Pool": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "The buffer pool is a cook's countertop: ingredients you keep reaching for stay within arm's reach, and when space runs out you clear away whatever you haven't touched in a while — you don't keep a meticulous list, you just remember roughly what you've used lately."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "shared_buffers too small",
            "body": "High disk read I/O and a hit ratio well below 99% on a working set that should fit in RAM. Cause: Hot pages are constantly evicted because the pool can't hold the working set. Fix: Raise shared_buffers toward ~25% of RAM and re-measure the hit ratio."
          },
          {
            "term": "shared_buffers too large",
            "body": "Performance degrades and double-buffering wastes memory. Cause: An oversized pool steals RAM from the OS cache and worsens duplication without proportional benefit. Fix: Keep shared_buffers moderate, let the OS cache do its part, and consider huge pages."
          },
          {
            "term": "A few hot pages thrash the cache",
            "body": "A large one-off scan evicts everyone's working set and latency spikes for all queries. Cause: Clock-sweep gives sequential scans the chance to flush hot pages; very large scans pollute the pool. Fix: Rely on Postgres's ring-buffer strategy for big scans and avoid unnecessary full-table reads in peak hours."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Buffer cache hit ratio for the current database:\nSELECT round(100.0 * blks_hit /\n  nullif(blks_hit + blks_read, 0), 2) AS hit_pct\nFROM pg_stat_database WHERE datname = current_database();\n\n-- What is actually living in the buffer pool (needs pg_buffercache):\nCREATE EXTENSION IF NOT EXISTS pg_buffercache;\nSELECT relname, count(*) AS buffers\nFROM pg_buffercache b JOIN pg_class c ON b.relfilenode = pg_relation_filenode(c.oid)\nGROUP BY relname ORDER BY buffers DESC LIMIT 10;\n\n-- How big the pool is:\nSHOW shared_buffers;"
      }
    ]
  },
  "postgres-internals:Work Memory and Sort/Hash Operations": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "work_mem is the size of your desk: a task whose papers all fit lets you sort them in one sweep, but the moment they overflow you're shuttling stacks to the floor and back — and every coworker has their own desk, so handing everyone a huge one can bankrupt the whole office."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Constant temp-file spills",
            "body": "Queries are slow and the log fills with 'temporary file' messages. Cause: work_mem is too small for the sorts/hashes these queries need, forcing disk-backed algorithms. Fix: Raise work_mem for the session or role running heavy analytics, not globally."
          },
          {
            "term": "Out-of-memory under concurrency",
            "body": "The OOM killer terminates Postgres during traffic spikes. Cause: Many connections each ran multi-node queries, and total work_mem usage exceeded RAM. Fix: Lower the global work_mem and bound concurrency (connection pooler); size for peak parallelism."
          },
          {
            "term": "Surprise from per-node multiplication",
            "body": "A single query uses far more memory than work_mem suggests. Cause: The plan has several sort/hash nodes, each entitled to its own work_mem. Fix: Inspect EXPLAIN for the number of memory-hungry nodes and set work_mem accordingly."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Turn on logging of every disk spill:\nSET log_temp_files = 0;\n-- then watch the server log for temp file sizes\n\n-- See whether a sort fit in memory or spilled:\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT * FROM orders ORDER BY created_at;\n-- look for 'Sort Method: external merge  Disk: ...'\n\n-- Current budget:\nSHOW work_mem;"
      }
    ]
  },
  "postgres-internals:Statistics and the pg_statistic Catalog": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Statistics are the navigator's depth chart: the ship is steered entirely from the chart, never by looking at the seabed — so an out-of-date chart sends you confidently onto the rocks."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Stale stats after a bulk load",
            "body": "Right after loading millions of rows, queries pick terrible plans. Cause: pg_statistic still reflects the old (or empty) table, so cardinalities are wildly off. Fix: Run ANALYZE on the table immediately after large loads; don't wait for autovacuum."
          },
          {
            "term": "Skewed column under-sampled",
            "body": "Queries filtering on a heavily skewed column estimate rows poorly. Cause: The default statistics target is too coarse to capture the distribution. Fix: Increase per-column resolution with ALTER TABLE ... SET STATISTICS and re-ANALYZE."
          },
          {
            "term": "Correlated columns mis-estimated",
            "body": "A multi-column predicate's estimate is far off even with fresh stats. Cause: Per-column stats assume independence; correlated columns break that assumption. Fix: Create extended statistics with CREATE STATISTICS (dependencies, ndistinct)."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Inspect a column's gathered statistics:\nSELECT attname, n_distinct, correlation, most_common_vals\nFROM pg_stats WHERE tablename = 'orders';\n\n-- Refresh statistics for one table:\nANALYZE orders;\n\n-- Capture cross-column dependencies:\nCREATE STATISTICS orders_stx (dependencies)\nON user_id, status FROM orders;\nANALYZE orders;"
      }
    ]
  },
  "postgres-internals:The Query Planner — Join Strategies": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "The three joins are three ways to match guests to seats: checking every guest against every chair by hand (nested loop), building a quick lookup of seat assignments and calling names (hash join), or zipping two pre-sorted lists together (merge join) — and seating the smallest group first keeps the line short."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Nested loop on a bad estimate",
            "body": "A query that should take milliseconds runs for minutes with a Nested Loop at the top. Cause: Underestimated outer rows made nested looping look cheap; the inner side is probed millions of times. Fix: Fix the underlying statistics; as a stopgap, test with enable_nestloop=off to confirm the diagnosis."
          },
          {
            "term": "Hash join spills to disk",
            "body": "A large hash join is far slower than expected and writes temp files. Cause: The build side didn't fit in work_mem, triggering batched hash join. Fix: Raise work_mem for that workload or reduce the build side with better filtering."
          },
          {
            "term": "Planner gives up on join order",
            "body": "A query with many joined tables plans slowly or picks an odd order. Cause: The number of tables exceeds join_collapse_limit, so exhaustive search is skipped. Fix: Raise join_collapse_limit cautiously, or restructure the query to constrain the search space."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- See which join the planner chose:\nEXPLAIN SELECT *\nFROM orders o JOIN users u ON u.id = o.user_id;\n\n-- Force a different strategy to compare costs:\nSET enable_hashjoin = off;\nEXPLAIN ANALYZE SELECT *\nFROM orders o JOIN users u ON u.id = o.user_id;\nRESET enable_hashjoin;\n\n-- Check the join-order search limit:\nSHOW join_collapse_limit;"
      }
    ]
  },
  "postgres-internals:The Query Planner — Scan Strategies": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Reading a table is like finding entries in a phone book: read every page if you want most of the names, flip straight to three pages if you want just a few, or — if there are a few dozen — jot down all the page numbers first and then walk through the book once in order."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Seq scan where an index should win",
            "body": "A selective query reads the whole table instead of using an index. Cause: Stale stats overestimate selectivity, or random_page_cost is set too high for fast SSD storage. Fix: Re-ANALYZE; on SSDs lower random_page_cost (e.g. to ~1.1) so index scans are costed fairly."
          },
          {
            "term": "Index scan thrashing on a wide range",
            "body": "An index scan returning many rows is slower than a seq scan would be. Cause: Each matching row is a random heap fetch; for large result sets that's more expensive than reading sequentially. Fix: Let the planner choose a bitmap or seq scan with correct stats; don't force the index."
          },
          {
            "term": "Index-only scan still hits the heap",
            "body": "An index-only scan shows many 'Heap Fetches' in EXPLAIN ANALYZE. Cause: The visibility map isn't up to date, so pages aren't marked all-visible and visibility must be checked in the heap. Fix: VACUUM the table to refresh the visibility map so index-only scans stay off the heap."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Watch the access method change with selectivity:\nEXPLAIN SELECT * FROM orders WHERE status = 'rare';\nEXPLAIN SELECT * FROM orders WHERE status = 'common';\n\n-- Confirm an index-only scan and its heap fetches:\nEXPLAIN (ANALYZE)\nSELECT user_id FROM orders WHERE user_id = 42;\n\n-- The cost knobs that drive the choice:\nSELECT name, setting FROM pg_settings\nWHERE name IN ('seq_page_cost','random_page_cost');"
      }
    ]
  },
  "postgres-internals:EXPLAIN and Reading Query Plans": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "A query plan is a recipe read from the deepest indentation outward: each step hands its result up to the next, and when one step claims it'll yield a pinch of an ingredient but actually dumps in a cupful, every step above it is thrown off."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Reading EXPLAIN without ANALYZE for perf",
            "body": "You trust the cost numbers but the query is still slow. Cause: Plain EXPLAIN shows only estimates; without ANALYZE you can't see where reality diverged. Fix: Use EXPLAIN (ANALYZE, BUFFERS) on a representative run (mind that ANALYZE actually executes the query)."
          },
          {
            "term": "Misreading nested-loop loops",
            "body": "A node looks cheap but the query is slow. Cause: Per-loop actual rows/time must be multiplied by loops; a small per-loop cost times millions of loops is huge. Fix: Always factor loops into nested-loop inner nodes when reading the plan."
          },
          {
            "term": "Ignoring high Buffers: read",
            "body": "Two runs of the same query differ wildly in speed. Cause: Cold cache: the slow run read pages from disk (Buffers: read) while the fast run hit shared_buffers. Fix: Add BUFFERS to EXPLAIN to distinguish cache state from genuine plan problems."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- The most useful everyday form:\nEXPLAIN (ANALYZE, BUFFERS, VERBOSE)\nSELECT * FROM orders WHERE user_id = 42;\n\n-- Machine-readable output for tools:\nEXPLAIN (FORMAT JSON)\nSELECT * FROM orders WHERE user_id = 42;\n\n-- Automatically log slow query plans:\nLOAD 'auto_explain';\nSET auto_explain.log_min_duration = '500ms';"
      }
    ]
  },
  "postgres-internals:VACUUM — Dead Tuple Cleanup": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "VACUUM is the building janitor unlocking apartments whose tenants moved out: the rooms become available to rent again immediately, but the building doesn't get any smaller — only a full renovation (VACUUM FULL) actually shrinks the footprint."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Autovacuum can't keep up",
            "body": "Dead tuples and table size climb steadily on a high-churn table. Cause: Default autovacuum thresholds are too lax for the write rate, so cleanup lags behind generation. Fix: Lower per-table autovacuum_vacuum_scale_factor and raise cost limits so it runs more often and faster."
          },
          {
            "term": "VACUUM FULL locks production",
            "body": "Running VACUUM FULL to reclaim space freezes the application. Cause: It takes ACCESS EXCLUSIVE and rewrites the whole table. Fix: Use pg_repack for online compaction, or schedule VACUUM FULL only in maintenance windows."
          },
          {
            "term": "Index-only scans degrade",
            "body": "Previously fast index-only scans start hitting the heap. Cause: The visibility map is stale because vacuum hasn't run, so pages aren't marked all-visible. Fix: Ensure regular VACUUM runs to keep the visibility map current."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Dead tuples and last (auto)vacuum per table:\nSELECT relname, n_dead_tup, last_autovacuum\nFROM pg_stat_user_tables ORDER BY n_dead_tup DESC;\n\n-- Vacuum a table and refresh its stats together:\nVACUUM (VERBOSE, ANALYZE) orders;\n\n-- Watch a vacuum in progress:\nSELECT * FROM pg_stat_progress_vacuum;"
      }
    ]
  },
  "postgres-internals:XID Wraparound — The Postgres Time Bomb": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "XIDs are a clock with an hour hand but no date: as long as you keep engraving “this already happened” on old events (freezing), you never confuse them with new ones — but stop engraving and eventually the hand sweeps back around and yesterday looks like tomorrow."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Approaching wraparound shutdown",
            "body": "Warnings about wraparound escalate, then the database stops accepting writes. Cause: Freezing fell behind (often a stuck autovacuum or a long-held xmin) and datfrozenxid age neared 2 billion. Fix: Resolve the blocker (idle transactions, disabled autovacuum), then run an aggressive VACUUM (FREEZE)."
          },
          {
            "term": "Autovacuum disabled 'for performance'",
            "body": "Months later, sudden anti-wraparound vacuums saturate I/O. Cause: Turning off autovacuum stops freezing, so emergency vacuums must eventually do it all at once. Fix: Never disable autovacuum globally; tune it instead and let freezing happen incrementally."
          },
          {
            "term": "MultiXact wraparound",
            "body": "Wraparound warnings appear even though XID age looks fine. Cause: Heavy use of shared row locks (FOR SHARE / FK checks) consumed MultiXact IDs, which have their own wraparound. Fix: Watch mxid_age as well as xid_age and ensure vacuum keeps both frozen."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- How many transactions until each database is in danger:\nSELECT datname, age(datfrozenxid),\n  2000000000 - age(datfrozenxid) AS xids_left\nFROM pg_database ORDER BY age(datfrozenxid) DESC;\n\n-- Per-table freeze age, worst first:\nSELECT relname, age(relfrozenxid)\nFROM pg_class WHERE relkind = 'r'\nORDER BY age(relfrozenxid) DESC LIMIT 10;\n\n-- Force freezing on a lagging table:\nVACUUM (FREEZE, VERBOSE) orders;"
      }
    ]
  },
  "postgres-internals:ANALYZE, Table Bloat, and Index Bloat": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "Bloat is a closet that's mostly empty hangers: you stop being able to find your clothes not because you own more, but because the deleted ones left their hangers behind — and only emptying and re-hanging the whole closet (a rewrite) makes it compact again."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Table grows, row count doesn't",
            "body": "Disk usage for a table climbs steadily while SELECT count(*) stays flat. Cause: Update/delete churn outpaces autovacuum, accumulating dead space that's reused slowly or not at all. Fix: Tune autovacuum to be more aggressive; reclaim existing bloat with pg_repack online."
          },
          {
            "term": "Index much larger than its table",
            "body": "An index's size dwarfs expectations and scans read excessive blocks. Cause: Deleted entries left sparse leaf pages that never merged back. Fix: REINDEX CONCURRENTLY to rebuild it compactly without blocking writes."
          },
          {
            "term": "Stale plans after a big load",
            "body": "Queries regress immediately after importing a lot of data. Cause: Statistics are stale; the data is fine but the planner's picture is wrong. Fix: Run ANALYZE (not just VACUUM) right after the load to refresh statistics."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Exact live/dead/free breakdown (needs pgstattuple):\nCREATE EXTENSION IF NOT EXISTS pgstattuple;\nSELECT * FROM pgstattuple('orders');\n\n-- Index density and leaf fragmentation:\nSELECT * FROM pgstatindex('orders_pkey');\n\n-- Biggest relations on disk:\nSELECT relname, pg_size_pretty(pg_total_relation_size(oid))\nFROM pg_class WHERE relkind = 'r'\nORDER BY pg_total_relation_size(oid) DESC LIMIT 10;"
      }
    ]
  },
  "postgres-internals:TOAST — Storage of Large Values": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "TOAST is a coat check: you don't drag an oversized suitcase to your dinner table — you hand it over, keep a small numbered ticket in your pocket, and only the moment you actually need the contents does someone go fetch and unpack it."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "SELECT * detoast overhead",
            "body": "Queries are slow whenever a wide TOASTed column is in the result, even when unused. Cause: Selecting the column forces fetching and decompressing all its TOAST chunks. Fix: Select only needed columns; avoid pulling large JSONB/text you won't use."
          },
          {
            "term": "Wrong strategy for substring access",
            "body": "Repeatedly reading slices of a large value is slower than expected. Cause: EXTENDED compresses the value, so any access must decompress the whole thing. Fix: Set the column's storage to EXTERNAL so slices can be read without full decompression."
          },
          {
            "term": "TOAST table bloat goes unnoticed",
            "body": "Disk usage grows but the visible table looks small. Cause: Updates to large values churn the hidden TOAST relation, which bloats independently. Fix: Include pg_total_relation_size (which counts TOAST) when monitoring and vacuum accordingly."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Find a table's hidden TOAST relation and its size:\nSELECT reltoastrelid::regclass,\n  pg_size_pretty(pg_relation_size(reltoastrelid))\nFROM pg_class WHERE relname = 'orders';\n\n-- Per-column storage strategy (p/e/x/m):\nSELECT attname, attstorage\nFROM pg_attribute\nWHERE attrelid = 'orders'::regclass AND attnum > 0;\n\n-- Change a column's TOAST strategy:\nALTER TABLE orders\nALTER COLUMN payload SET STORAGE EXTERNAL;"
      }
    ]
  },
  "postgres-internals:The Postgres Extension System": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Mental model",
        "text": "The extension system is a workshop with labeled wall sockets: the building supplies the power and the standard outlets (hooks and index interfaces), and any tool that's wired to the standard plug just works — several can run off the same circuit at once."
      },
      {
        "kind": "deflist",
        "heading": "Failure modes",
        "items": [
          {
            "term": "Version mismatch on upgrade",
            "body": "After a major Postgres upgrade an extension fails to load. Cause: Compiled C extensions are tied to a server version and ABI; the old binary doesn't match. Fix: Install the extension build matching the new major version, then run ALTER EXTENSION ... UPDATE."
          },
          {
            "term": "pg_stat_statements not capturing",
            "body": "The view exists but stays empty. Cause: The extension must be in shared_preload_libraries to install its executor hook at startup. Fix: Add it to shared_preload_libraries and restart the server, then CREATE EXTENSION."
          },
          {
            "term": "Hook-chaining extension conflicts",
            "body": "Enabling two hook-based extensions causes crashes or missing instrumentation. Cause: An extension installed its hook without preserving and calling the previous one, breaking the chain. Fix: Use well-maintained extensions; load order in shared_preload_libraries can matter for cooperation."
          }
        ]
      },
      {
        "kind": "code",
        "heading": "Observe it yourself",
        "code": "-- Top queries by total execution time (needs the extension):\nCREATE EXTENSION IF NOT EXISTS pg_stat_statements;\nSELECT query, calls, total_exec_time\nFROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;\n\n-- What extensions are available vs installed:\nSELECT name, default_version, installed_version\nFROM pg_available_extensions WHERE installed_version IS NOT NULL;\n\n-- Install an extension:\nCREATE EXTENSION IF NOT EXISTS pg_trgm;"
      }
    ]
  },
  "production-ai-agents:What Makes Agentic Systems Uniquely Hard": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Stop thinking 'API call you can retry' and start thinking 'distributed transaction you must checkpoint and make idempotent.' Every reliability decision flows from that shift."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A fintech ran a nightly agent that processed a queue of customer refunds: read the ticket, decide eligibility, call the payments tool, post a confirmation. One night a transient 503 came back from the LLM provider on refund #41 of 80."
          },
          {
            "term": "Symptom",
            "body": "The orchestrator caught the error and did what it did for any failed job — it restarted the run from the top. The agent re-read the queue, re-decided the first 40 refunds, and issued every one of them a second time. 40 customers were double-refunded before anyone noticed."
          },
          {
            "term": "Cause",
            "body": "The team modeled the agent run as a single stateless, idempotent unit of work, exactly like an HTTP handler. But the run had already committed 40 irreversible side effects. There was no record of which work was done, and the refund tool had no idempotency key."
          },
          {
            "term": "Fix",
            "body": "They added a checkpoint after each refund (persisting the ticket ID and outcome) so a restart resumes at #41, and an idempotency key per refund so a duplicate call is a no-op at the payments provider. The run became resumable instead of replayable."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Checkpointing",
            "body": "Persist progress after each completed step so a restart resumes where it stopped instead of replaying finished work."
          },
          {
            "term": "Idempotency keys",
            "body": "Tag every side-effecting tool call with a stable key so the downstream system treats a duplicate as a no-op."
          },
          {
            "term": "Saga modeling",
            "body": "Treat the run as a sequence of individually compensable steps, not one atomic transaction."
          },
          {
            "term": "Bounded blast radius",
            "body": "Gate irreversible actions behind explicit confirmation, dry-run, or a spend cap so a runaway agent can only do so much damage."
          }
        ]
      }
    ]
  },
  "production-ai-agents:The Anatomy of an Agent Loop": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Read an agent loop the way you read a distributed sequence diagram: assume every arrow fails, and notice that the loop-back edge is the one with no natural stopping point."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A research agent was asked to 'find the company's three biggest competitors and summarize each.' Its prompt rewarded thoroughness. After it had summarized three competitors, the model decided three more would be even better, then kept finding 'one more relevant company.'"
          },
          {
            "term": "Symptom",
            "body": "The loop ran for 90 minutes and 600+ LLM calls. It never produced a final answer — every iteration ended with another tool call rather than a completion, because nothing in the loop forced termination. The bill for that one task was larger than a week of normal traffic."
          },
          {
            "term": "Cause",
            "body": "The loop had no termination condition other than the model's own judgment. There was no max-step cap, no token budget, and no explicit 'finish' contract. The dashed edge in the diagram had no guard."
          },
          {
            "term": "Fix",
            "body": "They added a hard max-iteration cap, a per-run token budget that aborts when exceeded, and a structured 'final_answer' tool the model must call to exit — turning a vibe-based stop condition into an enforced one."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Max-iteration cap",
            "body": "Refuse to run the loop more than N times, regardless of what the model wants."
          },
          {
            "term": "Explicit finish contract",
            "body": "Force the model to call a dedicated final_answer / terminate tool to exit, instead of inferring completion."
          },
          {
            "term": "Per-edge guards",
            "body": "Validate output at Think, wrap Act in try/catch and timeout, schema-check at Observe — defend every arrow, not just the call site."
          },
          {
            "term": "Step budget",
            "body": "Allocate a finite token/time budget per run and abort the loop the moment it's exhausted."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Why Classic Software Engineering Still Wins": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "If you've built reliable microservices, you already know how to build reliable agents — the names you learned (saga, bulkhead, token bucket) are exactly the tools the next seven chapters need."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "An ML-heavy startup built an impressive agent platform with zero infrastructure borrowed from classic backend work: no queue, no circuit breaker, direct synchronous tool calls. It demoed beautifully. Then a downstream vendor API started returning slow 500s under load."
          },
          {
            "term": "Symptom",
            "body": "Every agent that touched that tool blocked on the slow call, threads piled up, the thread pool exhausted, and the entire platform — including agents that never used the failing tool — became unresponsive. A single weak dependency took down everything."
          },
          {
            "term": "Cause",
            "body": "There was no circuit breaker to stop calling the failing dependency, and no bulkhead to isolate it. This is the textbook 'cascading failure' that Hystrix-style libraries were built to prevent in 2011 — reintroduced because the team assumed agents needed new playbooks."
          },
          {
            "term": "Fix",
            "body": "They wrapped each external tool in a circuit breaker (open after N failures, fail fast while open) and gave each tool its own bounded resource pool (a bulkhead) so one slow dependency could not consume all capacity."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Circuit breaker",
            "body": "Trip open after repeated failures and fail fast instead of piling requests onto a dying dependency."
          },
          {
            "term": "Bulkhead",
            "body": "Give each tool / agent class its own isolated resource pool so one failure can't drain shared capacity."
          },
          {
            "term": "Dead-letter queue",
            "body": "Route work that fails repeatedly to a side channel for inspection instead of retrying it forever."
          },
          {
            "term": "Message queue decoupling",
            "body": "Put a queue between agents and downstream systems so producers and consumers fail independently."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Memory Management": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "The context window is a fixed-size buffer with an eviction policy — design that policy deliberately, or it will silently throw away the one thing the agent can't run without: its goal."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A long-running coding agent was assigned to migrate a service across roughly 50 files. The instructions, acceptance criteria, and 'do not touch the auth module' constraint were all in the original system message. The agent worked file by file, each edit adding tool output to the context."
          },
          {
            "term": "Symptom",
            "body": "Around the 50th tool call the agent started making changes that contradicted the original spec, including edits to the auth module it had been told to avoid. It wasn't confused in an obvious way — it confidently pursued a subtly wrong objective."
          },
          {
            "term": "Cause",
            "body": "The runtime used oldest-first truncation. By call 50 the original instructions had been evicted to make room. The agent was now reasoning purely from recent tool outputs, with no memory of the actual goal or its constraints."
          },
          {
            "term": "Fix",
            "body": "They pinned the goal and hard constraints as immovable system context, summarized completed work into a rolling digest, and offloaded full file contents to an external store retrieved on demand — so the working window always contained the goal plus only what the current step needed."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Sliding window",
            "body": "Keep the most recent N turns verbatim and let older turns fall out of the working context."
          },
          {
            "term": "Recursive summarization",
            "body": "Compress finished work into a running digest so its meaning survives even when its tokens don't."
          },
          {
            "term": "Memory tiering",
            "body": "Pin goal + constraints, keep recent steps in-context, and push bulk detail to an external store."
          },
          {
            "term": "Selective retrieval (RAG)",
            "body": "Fetch only the few records relevant to the current step instead of carrying everything inline."
          },
          {
            "term": "Pinned goal anchor",
            "body": "Mark the objective and hard constraints as never-evictable so they can't be truncated away."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Concurrency": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "The model is now a source of load that can decide to do 100× more work at runtime — so the only safe concurrency is the kind you bound externally, never the kind the agent grants itself."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A 'deep research' agent was designed to break a question into subtopics and dispatch a sub-agent per subtopic. Subtopics were allowed to spawn their own sub-agents for follow-up questions. For most queries this fanned out two levels and finished fine."
          },
          {
            "term": "Symptom",
            "body": "One broad query fanned out three levels deep. The recursion produced over 9,000 concurrent LLM requests within seconds. The provider returned 429s en masse, in-flight agents failed, retries piled on, and the account was briefly rate-limited across all products — including unrelated production traffic."
          },
          {
            "term": "Cause",
            "body": "Fan-out depth and breadth were controlled by the model with no global ceiling. There was no concurrency limiter and no shared budget across the whole agent tree, so the tree could grow without bound."
          },
          {
            "term": "Fix",
            "body": "They added a global concurrency semaphore (at most K outstanding LLM calls account-wide), a max fan-out depth and breadth per node, and a shared task queue so excess work waited instead of launching. The tree could still be wide, but never explosive."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Worker pool",
            "body": "Process tasks with a fixed number of workers so total concurrency is a constant you chose, not one the model improvised."
          },
          {
            "term": "Task queue",
            "body": "Buffer pending work in a queue and let workers pull at a sustainable rate."
          },
          {
            "term": "Distributed lock / mutex",
            "body": "Serialize writes to a shared resource so two agents can't clobber the same row or file."
          },
          {
            "term": "Concurrency limiter (semaphore)",
            "body": "Cap the number of simultaneous LLM/tool calls across the entire agent tree, not per agent."
          },
          {
            "term": "Bounded fan-out",
            "body": "Hard-limit how many sub-agents any node may spawn and how deep recursion may go."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Backpressure": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "A bigger queue is not backpressure — it's a longer fuse. Real backpressure makes the producer feel the consumer's pain and slow down before anything breaks."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A web-research agent crawled a site by extracting links from each page and queueing them for a content-summarization worker. The crawl logic had no depth limit, and the queue was a plain in-memory list with no maximum size."
          },
          {
            "term": "Symptom",
            "body": "On a large site the agent enqueued links faster than the summarizer could drain them. The queue grew to hundreds of thousands of pending URLs, memory climbed steadily for twenty minutes, and the process was OOM-killed — losing all in-flight work with no record of what had or hadn't been processed."
          },
          {
            "term": "Cause",
            "body": "The producer (crawler) had no awareness of the consumer's (summarizer's) throughput. With an unbounded queue, the rate mismatch was stored as memory growth until the process died."
          },
          {
            "term": "Fix",
            "body": "They switched to a bounded queue: enqueue blocks (or sheds) when full, which naturally throttles the crawler to the summarizer's pace. They added a token-bucket limit on outbound fetches and a crawl-depth cap so the workload was bounded at the source too."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Bounded queue",
            "body": "Cap queue size so enqueue blocks or rejects when full, turning a memory leak into honest backpressure."
          },
          {
            "term": "Token bucket rate limiting",
            "body": "Allow work only as fast as tokens refill, smoothing bursts to a sustainable rate."
          },
          {
            "term": "Load shedding",
            "body": "Deliberately drop or defer excess work when overloaded instead of accepting it and crashing."
          },
          {
            "term": "High/low watermarks",
            "body": "Signal the producer to pause at a high fill level and resume at a low one, avoiding oscillation."
          },
          {
            "term": "Pull-based demand",
            "body": "Let consumers request work when ready (reactive streams) rather than letting producers push unconditionally."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Retries": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Before you retry anything, ask 'is this safe to do twice?' — if the answer is no, you need an idempotency key, not another attempt."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A support agent ended each resolved ticket by calling a send_email tool to notify the customer. The tool returned a confirmation the agent parsed to decide success. One day the email service was slow: the email actually sent, but the confirmation timed out before arriving."
          },
          {
            "term": "Symptom",
            "body": "The agent interpreted the timeout as failure and retried. The email service, still slow, kept sending the email and timing out on the confirmation. Five retries later, the customer had received the same resolution email five times."
          },
          {
            "term": "Cause",
            "body": "The send_email tool was non-idempotent and had no idempotency key, while the retry logic couldn't distinguish 'the action failed' from 'the action succeeded but I didn't hear back.' Retrying an at-least-once operation produced duplicates."
          },
          {
            "term": "Fix",
            "body": "They added an idempotency key per outbound email so the service de-duplicates repeats, capped retries with a budget, and treated confirmation timeouts as 'unknown' (verify before re-sending) rather than 'failed.'"
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Exponential backoff + jitter",
            "body": "Grow the delay between attempts and randomize it so retries don't synchronize into a thundering herd."
          },
          {
            "term": "Idempotency keys",
            "body": "Stamp side-effecting calls with a stable key so a retried operation is de-duplicated downstream."
          },
          {
            "term": "Retry budget",
            "body": "Cap total retries per run (and per dependency) so failures can't burn unbounded tokens or hammer an API."
          },
          {
            "term": "Failure classification",
            "body": "Retry only transient/retryable errors; fail fast on permanent ones like 400s or schema violations."
          },
          {
            "term": "Checkpoint-based resume",
            "body": "On retry, resume from the last good checkpoint instead of re-running already-completed steps."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Timeouts": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Put a deadline on every layer and propagate the remaining budget inward — because the only difference between a working agent and a hung one is whether something is counting down the clock."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A data-enrichment agent called an external geocoding tool. Normally the tool replied in under a second. Configuration drift left that specific tool call with no client-side timeout, on the assumption that 'the API is fast.'"
          },
          {
            "term": "Symptom",
            "body": "One night the geocoding provider had a partial outage and held connections open without ever responding. The agent's worker blocked on that read forever. It held a GPU-backed inference slot, an open database connection, and its queue slot for six hours until someone noticed throughput had quietly dropped and killed the worker."
          },
          {
            "term": "Cause",
            "body": "There was no tool-execution timeout and no total-run deadline, so a non-responding dependency produced an indefinite hang rather than a bounded failure. 'Stuck' was indistinguishable from 'busy.'"
          },
          {
            "term": "Fix",
            "body": "They set a tool timeout (with a small grace), a total-run deadline, and deadline propagation so no call can exceed the remaining run budget. On timeout the agent now releases resources and returns a graceful partial result instead of holding everything hostage."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Layered timeout budgets",
            "body": "Independent ceilings at the LLM-call, tool, step, sub-agent, and total-run levels."
          },
          {
            "term": "Deadline propagation",
            "body": "Compute the total deadline once and pass the remaining time down the stack so inner calls can't overrun it."
          },
          {
            "term": "Graceful partial completion",
            "body": "On timeout, return whatever useful work is done and release resources rather than failing hard."
          },
          {
            "term": "Watchdog / heartbeat",
            "body": "Have a supervisor track liveness and forcibly reclaim a worker that stops making progress."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Failure Handling": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "The exception is the easy failure. Engineer hardest against the four that never throw — wrong data, phantom tools, wrong goals, and half-finished runs — because nothing will alert you unless you build the detector yourself."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A document-processing agent ran a 20-step pipeline per file: parse, extract, transform, write to three systems, notify owners. Each step had real side effects. The pipeline ran as one long function with no intermediate state persisted."
          },
          {
            "term": "Symptom",
            "body": "At step 19 of 20, on a particularly large file, the worker hit an out-of-memory error and crashed. The orchestrator restarted the job from step 1 — re-parsing, re-extracting, and re-writing to all three downstream systems, duplicating records and re-notifying owners who'd already been emailed."
          },
          {
            "term": "Cause",
            "body": "There were no checkpoints, so the only recovery option was a full restart. And because the steps weren't idempotent and had no saga compensations, the restart re-executed 18 already-successful side effects."
          },
          {
            "term": "Fix",
            "body": "They checkpointed state after each step (so a restart resumes at 19), made downstream writes idempotent, and added a saga so a mid-pipeline failure can compensate completed steps in reverse instead of blindly replaying them."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Structured output validation",
            "body": "Force tool calls and final answers through a schema; reject anything that doesn't conform before acting on it."
          },
          {
            "term": "Output assertions",
            "body": "Check invariants on tool results (ranges, non-empty, expected shape) to catch soft errors that don't throw."
          },
          {
            "term": "Circuit breaker",
            "body": "After repeated failures from a tool or step, stop calling it and fail fast instead of looping on a known-bad path."
          },
          {
            "term": "Saga / compensating transactions",
            "body": "Pair each committed step with an undo so a later failure can roll the world back safely."
          },
          {
            "term": "Checkpointing",
            "body": "Persist state after each step so a crash resumes from the last good point instead of replaying everything."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Observability": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Instrument the agent as if a post-mortem is inevitable — because when it does something harmful, the only thing standing between you and 'we have no idea why' is the trace you remembered to capture."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "An autonomous agent with write access to a CRM ran unattended overnight. In the morning, support discovered it had bulk-updated hundreds of records with a clearly wrong field value. Leadership wanted to know what happened and why."
          },
          {
            "term": "Symptom",
            "body": "The team had nothing to reconstruct the decision with — no per-step logs of the prompts and responses, no trace tying the run together, no metrics showing when behavior diverged. They could see the damaged records but not the reasoning, the inputs, or the sequence of choices that produced them."
          },
          {
            "term": "Cause",
            "body": "Observability was an afterthought: a few unstructured log lines and no trace IDs. With 50+ steps per run and no span-per-step tracing, the agent was a literal black box during the one moment it mattered."
          },
          {
            "term": "Fix",
            "body": "They instrumented every LLM call (full prompt, response, tokens, latency) and every tool call as child spans under a per-run trace ID, added metrics with alerting on anomalous run length and tool-failure rate, and built dashboards to replay any run step by step."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Trace-ID propagation",
            "body": "Generate one ID per run and thread it through every LLM and tool call (and sub-agent) for end-to-end reconstruction."
          },
          {
            "term": "Structured reasoning logs",
            "body": "Log each step as structured data — prompt, response, chosen tool, args, tokens, latency — not free-text prints."
          },
          {
            "term": "RED/USE metrics",
            "body": "Track rate, errors, and duration per tool and per step (and resource saturation) to spot degradation early."
          },
          {
            "term": "Token-budget metrics",
            "body": "Treat tokens-per-run as a first-class metric so cost and runaway loops surface as graphs, not surprises."
          },
          {
            "term": "Run-length anomaly detection",
            "body": "Alert when steps-per-run or tokens-per-run drift outside the normal band — an early signal of loops or confusion."
          }
        ]
      }
    ]
  },
  "production-ai-agents:The Reliable Agent Stack": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "There's no clever shortcut around the stack — each layer is a tax you pay once or an incident you pay for repeatedly, and the model in the middle is the easy part."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "A team shipped an agent product with a great loop and a memory manager, but deferred 'the infra stuff' — queue, timeouts, checkpoints, tracing — to a later milestone. It worked in the demo and the early beta."
          },
          {
            "term": "Symptom",
            "body": "Under real traffic it failed in waves, one chapter at a time: first runaway concurrency (no pool), then OOM from an unbounded queue (no backpressure), then duplicate side effects on restart (no checkpoints), then a multi-hour debugging session with no traces. Each incident matched a missing layer precisely."
          },
          {
            "term": "Cause",
            "body": "The stack was incomplete. Every omitted layer was a latent production incident waiting for the load that would trigger its corresponding failure mode."
          },
          {
            "term": "Fix",
            "body": "They built out the full stack incrementally, prioritized by which failure was hurting most: bounded queue and worker pool first, then checkpoints and idempotent tools, then layered timeouts, then end-to-end tracing and circuit breakers. The waves stopped as each layer landed."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Task queue layer",
            "body": "Owns backpressure and absorbs bursts so producers and the agent fleet decouple."
          },
          {
            "term": "Worker pool + concurrency limiter",
            "body": "Owns concurrency: a fixed, bounded number of agents and outstanding calls."
          },
          {
            "term": "Checkpoint store",
            "body": "Owns recovery and resumable retries so crashes don't replay completed side effects."
          },
          {
            "term": "Timeout manager + tool registry",
            "body": "Owns timeouts (deadlines everywhere) and safe retries (idempotency keys per tool)."
          },
          {
            "term": "Trace collector + circuit breaker",
            "body": "Owns observability (span per step) and failure containment (trip open on repeated faults)."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Failure Mode Catalog": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Name your failures. An unnamed incident is a research project; a named one is a checklist item with a fix you already wrote three chapters ago."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "An on-call engineer was paged for an agent platform behaving erratically: cost spiking, some runs never finishing, duplicate notifications going out. With no catalog, they treated it as one mysterious mega-bug and burned hours chasing a single root cause."
          },
          {
            "term": "Symptom",
            "body": "It was actually three distinct, well-known failure modes happening at once — an Infinite Loop (runs never finishing), a Retry Storm (cost spike), and a Side Effect Replay (duplicate notifications). Conflating them made each impossible to fix."
          },
          {
            "term": "Cause",
            "body": "Without a shared vocabulary of failure modes, the team couldn't decompose the incident. Every symptom looked novel, so triage had no structure."
          },
          {
            "term": "Fix",
            "body": "They adopted this catalog as a triage checklist. Each symptom now maps to a named mode with a known trigger and fix (loop → max-iteration cap; cost spike → backoff + retry budget; duplicates → idempotency keys). Mean-time-to-diagnose dropped sharply."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Failure-mode triage checklist",
            "body": "Match each symptom to a named mode (1–10) so incidents decompose into known problems with known fixes."
          },
          {
            "term": "Frequency × severity prioritization",
            "body": "Invest defenses in the upper-right quadrant first — the modes that are both common and damaging."
          },
          {
            "term": "Guardrail-per-mode",
            "body": "Ship a specific control for each mode: caps for loops, budgets for storms, keys for replays, traces for blind failures."
          },
          {
            "term": "Pre-mortem mapping",
            "body": "Before launch, walk the catalog and confirm each mode already has a mitigation in the stack."
          }
        ]
      }
    ]
  },
  "production-ai-agents:Engineering Principles That Never Go Away": {
    "sections": [
      {
        "kind": "prose",
        "heading": "Key insight",
        "text": "Bet on principles, not frameworks. The model and the tooling will be obsolete in a year; design-for-failure, idempotency, timeouts, and observability will still be exactly what separates a reliable agent from an incident."
      },
      {
        "kind": "deflist",
        "heading": "A failure in the wild",
        "items": [
          {
            "term": "Scenario",
            "body": "Over two years, one company rewrote its agent platform three times — chasing a new framework each time in the belief that the next one would finally be reliable. Each rewrite reset the infrastructure and re-litigated the same architectural decisions."
          },
          {
            "term": "Symptom",
            "body": "Reliability never improved across rewrites. The same incidents recurred on every framework: loops, replays, hangs, blind failures. The tools changed; the failures didn't. Enormous effort produced no durable gain."
          },
          {
            "term": "Cause",
            "body": "They treated reliability as a property of the framework rather than of their engineering principles. Because the eight principles were never internalized, every new tool reproduced the same gaps."
          },
          {
            "term": "Fix",
            "body": "They froze the framework and instead codified the eight principles as non-negotiable platform invariants — enforced in code review, scaffolding, and shared libraries. Reliability finally improved, and it carried forward intact when they later did change frameworks."
          }
        ]
      },
      {
        "kind": "deflist",
        "heading": "Patterns that fix it",
        "items": [
          {
            "term": "Principles as invariants",
            "body": "Encode the eight principles into shared libraries, scaffolds, and review checklists so they hold regardless of framework."
          },
          {
            "term": "Recovery-first design",
            "body": "Write the checkpoint, timeout, and rollback path before the happy path — assume every step fails."
          },
          {
            "term": "Idempotent-by-default tools",
            "body": "Make 'safe to replay' a requirement for adding any tool, not an afterthought."
          },
          {
            "term": "Degrade, don't collapse",
            "body": "Design every operation to return a useful partial result on failure instead of an all-or-nothing crash."
          }
        ]
      }
    ]
  }
};
