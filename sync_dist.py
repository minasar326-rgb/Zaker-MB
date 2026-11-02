import os, shutil, glob

def copy_if_exists(src, dst):
    if os.path.exists(src):
        d = os.path.dirname(dst)
        if d:
            os.makedirs(d, exist_ok=True)
        shutil.copy2(src, dst)

# 1. Ensure .nojekyll in root and dist
with open(".nojekyll", "w", encoding="utf-8") as f:
    pass
with open("dist/.nojekyll", "w", encoding="utf-8") as f:
    pass

# 2. Copy all public files into root and dist
for root, dirs, files in os.walk("public"):
    for file in files:
        src = os.path.join(root, file)
        rel = os.path.relpath(src, "public")
        copy_if_exists(src, os.path.join(".", rel))
        copy_if_exists(src, os.path.join("dist", rel))

# 3. Synchronize any hashed assets from dist/ into root
for f in glob.glob("dist/*.*"):
    base = os.path.basename(f)
    if base != "index.html":
        copy_if_exists(f, os.path.join(".", base))

# 4. Standardize manifest link in dist/index.html
if os.path.exists("dist/index.html"):
    with open("dist/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    # Ensure manifest points to ./manifest.json
    import re
    html = re.sub(r'<link rel="manifest" href="[^"]+"', '<link rel="manifest" href="./manifest.json"', html)
    
    with open("dist/index.html", "w", encoding="utf-8") as f:
        f.write(html)
    
    # Copy to root index.html, Zaker.html, 404.html
    copy_if_exists("dist/index.html", "index.html")
    copy_if_exists("dist/index.html", "Zaker.html")
    copy_if_exists("dist/index.html", "404.html")
    print("Copied updated dist/index.html to index.html, Zaker.html, 404.html")

# 5. Synchronize manifest.json across all variants
with open("public/manifest.json", "r", encoding="utf-8") as f:
    manifest_data = f.read()

for m in glob.glob("*manifest*.*") + glob.glob("dist/*manifest*.*"):
    if m.endswith(".json"):
        with open(m, "w", encoding="utf-8") as f:
            f.write(manifest_data)

# 6. Synchronize sw.js
with open("sw.js", "r", encoding="utf-8") as f:
    sw_data = f.read()

for sw_dest in ["public/sw.js", "dist/sw.js"]:
    with open(sw_dest, "w", encoding="utf-8") as f:
        f.write(sw_data)

print("sync_dist completed successfully!")
