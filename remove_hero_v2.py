import os
import re

files_to_process = [
    r"src\app\donors\[id]\page.tsx",
    r"src\app\login\page.tsx",
    r"src\app\feedback\page.tsx",
    r"src\app\dashboard\page.tsx",
    r"src\app\compare\page.tsx",
    r"src\app\register\page.tsx",
    r"src\app\selected-donors\page.tsx",
    r"src\app\search-analytics\page.tsx",
    r"src\app\saved-searches\page.tsx",
    r"src\app\requests\page.tsx",
    r"src\app\patient-details\page.tsx",
    r"src\app\requests\board\page.tsx",
    r"src\app\admin\requests\page.tsx",
    r"src\app\admin\page.tsx"
]

def find_matching_close(text, start_idx):
    depth = 0
    i = start_idx
    while i < len(text):
        if text.startswith('<div', i) or text.startswith('<form', i) or text.startswith('<section', i):
            depth += 1
            i += 4
        elif text.startswith('</div', i) or text.startswith('</form', i) or text.startswith('</section', i):
            depth -= 1
            if depth == 0:
                # find the closing '>'
                while text[i] != '>':
                    i += 1
                return i + 1
            i += 5
        else:
            i += 1
    return -1

for file_path in files_to_process:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if there is a ternary bg-[#1e293b] which is inline style (like in admin/requests/page.tsx)
    # The user wanted to remove the hero section, not the inline styles. We only target the block that starts the hero.
    # The hero block typically starts with '<div className=\"bg-[#1e293b] text-white pb-'
    # In some pages it might be <section className=\"...
    
    # Let's find the start
    start_match = re.search(r'(?:\{\/\*\s*Hero\s*(?:Section)?\s*\*\/\}\s*)?<(?:div|section) className=\"(?:relative )?bg-\[\#1e293b\] text-white[^\"]*\">', content)
    
    if not start_match:
        print(f"Hero section not found in {file_path}")
        continue
        
    start_idx = start_match.start()
    
    # Find the tag name used (div or section)
    tag_match = re.search(r'<(div|section)', start_match.group(0))
    tag_name = tag_match.group(1)
    
    # We need to find where the actual tag starts to pass to our depth finder
    tag_start = content.find(f'<{tag_name}', start_idx)
    
    end_idx = find_matching_close(content, tag_start)
    
    if end_idx == -1:
        print(f"Could not find matching close tag in {file_path}")
        continue
        
    # Replace the hero block with an empty string
    new_content = content[:start_idx] + content[end_idx:]
    
    # Now adjust padding in the next container
    new_content = re.sub(r'(<main[^>]*className=\"[^\"]*)py-8', r'\1pt-8', new_content)
    new_content = re.sub(r'(<div[^>]*className=\"[^\"]*flex-grow[^\"]*)py-8', r'\1pt-8', new_content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {file_path}")

