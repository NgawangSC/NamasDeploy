#!/usr/bin/env python3

# Script to fix React Hooks rules violation by moving useEffect before conditional returns

with open('src/pages/ProjectDetailPage.js', 'r') as f:
    content = f.read()

# Find the problematic useEffect block
useEffect_start = content.find('  // Keyboard controls for fullscreen\n  useEffect(')
if useEffect_start == -1:
    print("Could not find the problematic useEffect")
    exit(1)

# Find the end of this useEffect block
useEffect_end = content.find('  }, [isFullscreen, closeFullscreen, handleFullscreenPrev, handleFullscreenNext])', useEffect_start)
if useEffect_end == -1:
    print("Could not find the end of useEffect")
    exit(1)

useEffect_end = content.find('\n', useEffect_end) + 1  # Include the newline

# Extract the useEffect block
useEffect_block = content[useEffect_start:useEffect_end]

# Remove the useEffect from its current position
content_without_useEffect = content[:useEffect_start] + content[useEffect_end:]

# Find where to insert it (after the cleanup useEffect)
insert_point = content_without_useEffect.find('  }, [])\n') + len('  }, [])\n')

# Insert the useEffect at the correct position
fixed_content = (
    content_without_useEffect[:insert_point] + 
    '\n' + useEffect_block + 
    content_without_useEffect[insert_point:]
)

# Write the fixed content
with open('src/pages/ProjectDetailPage.js', 'w') as f:
    f.write(fixed_content)

print("Fixed the React Hooks rules violation!")
