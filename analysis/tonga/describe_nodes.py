#!/usr/bin/env python3
"""Build per-node packets for descriptions, and merge returned descriptions into topology.json.

  python3 analysis/tonga/describe_nodes.py packets [N]      -> analysis/tonga/packets/<batch>.md (40 largest by loc)
  python3 analysis/tonga/describe_nodes.py merge desc.json  -> validates names/numbers against packets, merges
"""
import json, os, re, sys

D = "analysis/tonga"
T = f"{D}/topology.json"
topo = json.load(open(T))
leaves = {c["id"]: c for d in topo["root"]["children"] for c in d["children"]}
conn = {i: [] for i in leaves}
for e in topo["edges"]:
    conn[e["source"]].append(f"{e['kind']} -> {e['target']} ({leaves[e['target']]['name']})")
    conn[e["target"]].append(f"{e['kind']} <- {e['source']} ({leaves[e['source']]['name']})")


def excerpt(node, n=150):
    f = node.get("file", "")
    if node["kind"] == "datastore":
        return ""
    path, _, frag = f.partition("#")
    lines = open(path, encoding="utf-8", errors="replace").read().split("\n")
    if m := re.match(r"L(\d+)-L(\d+)", frag):
        s, e = int(m[1]) - 1, int(m[2])
    elif frag:
        rng = re.search(r"\(mod ([\d-]+)\)", node["name"])
        s = next((i for i, l in enumerate(lines) if re.match(rf"^\s*/\* {rng[1].split('-')[0]} \*/\s*$", l)), 0) if rng else 0
        e = len(lines)
    else:
        s, e = 0, len(lines)
    out = [l[:200] for l in lines[s:e] if l.strip()][:n]
    return "\n".join(out)


def packet(i):
    node = leaves[i]
    return (f"## NODE {i}\nname: {node['name']}\nkind: {node['kind']}\nfile: {node.get('file','')}\nloc: {node.get('loc','')}\n"
            f"connections:\n" + "\n".join("  " + c for c in conn[i]) + f"\nexcerpt:\n```\n{excerpt(node)}\n```\n")


if sys.argv[1] == "packets":
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    chosen = sorted(leaves, key=lambda i: -(leaves[i].get("loc") or 0))[:n]
    os.makedirs(f"{D}/packets", exist_ok=True)
    for b in range(0, len(chosen), 8):
        open(f"{D}/packets/batch{b//8}.md", "w").write("\n".join(packet(i) for i in chosen[b:b + 8]))
    json.dump(chosen, open(f"{D}/packets/chosen.json", "w"))
    print(len(chosen), "nodes in", (len(chosen) + 7) // 8, "batches")
elif sys.argv[1] == "merge":
    desc = json.load(open(sys.argv[2]))
    ok, bad = 0, []
    for i, text in desc.items():
        p = packet(i)
        tokens = set(re.findall(r"\b\d+(?:\.\d+)*\b", text)) | set(re.findall(r"\b\w*[a-z][A-Z]\w*\b|\b\w+_\w+\b|\b[\w-]+\.(?:js|html|txt|png|css|json|yml)\b", text))
        missing = [t for t in tokens if t not in p and t.lower() not in p.lower()]
        words = len(text.split())
        if missing or not 40 <= words <= 110:
            bad.append((i, words, missing[:6]))
            continue
        leaves[i]["description"] = text
        ok += 1
    json.dump(topo, open(T, "w"), indent=1, ensure_ascii=False)
    print("merged", ok)
    for b in bad:
        print("REJECTED", *b)
