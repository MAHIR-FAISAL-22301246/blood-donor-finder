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

for file_path in files_to_process:
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Use regex to find the hero section. It usually starts with <div className=\"bg-[#1e293b]...
    # and ends right before <main or <div className=\"flex-grow...
    # Let's match from:
    # {/\* Hero Section \*/}
    # <div className=\"bg-[#1e293b]...
    # all the way up to:
    # <main className=\"flex-grow container... OR <div className=\"flex-grow container...
    
    # We can match: \s*\{\/\*\s*Hero Section\s*\*\/\}\s*<div className=\"bg-\[\#1e293b\].*?(?=<main|<div className=\"flex-grow)
    # Some don't have the Hero Section comment.
    
    pattern = re.compile(r'\s*(?:\{\/\*\s*Hero Section\s*\*\/\}\s*)?<div className=\"bg-\[\#1e293b\] text-white.*?(?=<main|<div[^>]*className=\"(?:[^\"]*flex-grow[^\"]*|.*max-w-7xl.*|.*container.*)\")', re.DOTALL)
    
    new_content = pattern.sub('\n      ', content)
    
    # Now replace py-8 with pt-8 in the main tag to maintain spacing
    new_content = re.sub(r'(<main[^>]*className=\"[^\"]*)py-8', r'\1pt-8', new_content)
    new_content = re.sub(r'(<div[^>]*className=\"[^\"]*)py-8', r'\1pt-8', new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file_path}")
    else:
        print(f"No changes in {file_path}")

