import os, shutil, glob, re

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

# 3. Synchronize any hashed assets from dist/ into root (only if not already existing, ignore duplicate hashes)
for f in glob.glob("dist/*.*"):
    base = os.path.basename(f)
    if base == "index.html":
        continue
    # Ignore any file that has the same hash repeated (e.g. name-HASH-HASH.ext)
    if re.search(r'-([A-Za-z0-9_-]{6,})-\1\.', base):
        continue
    target = os.path.join(".", base)
    if not os.path.exists(target):
        copy_if_exists(f, target)

# 4. Standardize manifest link in dist/index.html
if os.path.exists("dist/index.html"):
    with open("dist/index.html", "r", encoding="utf-8") as f:
        html = f.read()
    
    # Ensure manifest points to ./manifest.json
    html = re.sub(r'<link rel="manifest" href="[^"]+"', '<link rel="manifest" href="./manifest.json"', html)
    
    with open("dist/index.html", "w", encoding="utf-8") as f:
        f.write(html)
    
    # Copy to root index.html, Zaker.html, 404.html
    copy_if_exists("dist/index.html", "index.html")
    copy_if_exists("dist/index.html", "Zaker.html")
    copy_if_exists("dist/index.html", "404.html")
    print("Copied updated dist/index.html to index.html, Zaker.html, 404.html")

# 5. Synchronize manifest.json across Arabic variants only (never overwrite manifest-en or manifest-el)
with open("public/manifest.json", "r", encoding="utf-8") as f:
    manifest_data = f.read()

existing_manifests = set(glob.glob("manifest.json") + glob.glob("manifest-*.json") + 
                         glob.glob("dist/manifest.json") + glob.glob("dist/manifest-*.json"))

for m in existing_manifests:
    base = os.path.basename(m)
    # Never overwrite localized manifests
    if "manifest-en" in base or "manifest-el" in base:
        continue
    # Ignore any merged names like manifest-*-*.json
    if base.count("-") > 1:
        continue
    with open(m, "w", encoding="utf-8", newline="\n") as f:
        f.write(manifest_data)

# 6. Synchronize sw.js
with open("public/sw.js", "r", encoding="utf-8") as f:
    sw_data = f.read()

for sw_dest in ["sw.js", "dist/sw.js"]:
    with open(sw_dest, "w", encoding="utf-8", newline="\n") as f:
        f.write(sw_data)

print("sync_dist completed successfully!")
