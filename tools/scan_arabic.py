import os, re

arabic_regex = re.compile(r'[\u0600-\u06FF]')

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            if 'i18n.ts' in path or 'motivation.ts' in path:
                continue
            with open(path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            found = []
            for i, line in enumerate(lines):
                stripped = line.strip()
                if stripped.startswith('//') or stripped.startswith('/*'):
                    continue
                if arabic_regex.search(line):
                    found.append((i+1, stripped))
            if found:
                print(f"=== {path} ({len(found)} lines) ===")
                for line_no, content in found[:15]:
                    ascii_clean = content.encode('ascii', 'replace').decode('ascii')
                    print(f"  {line_no}: {ascii_clean}")
