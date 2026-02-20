#!/bin/bash
# Install personal VS Code extensions from extensions.local.txt

EXTENSIONS_FILE="/workspace/.devcontainer/extensions.local.txt"

if [ ! -f "$EXTENSIONS_FILE" ]; then
    echo "No personal extensions file found, skipping..."
    exit 0
fi

echo "Installing personal extensions from $EXTENSIONS_FILE..."
while IFS= read -r extension || [ -n "$extension" ]; do
    # Skip empty lines and comments
    [[ -z "$extension" || "$extension" =~ ^[[:space:]]*# ]] && continue
    # Trim whitespace
    extension=$(echo "$extension" | xargs)
    [ -z "$extension" ] && continue

    echo "Installing: $extension"
    code --install-extension "$extension" --force 2>/dev/null || true
done < "$EXTENSIONS_FILE"

echo "Extension installation complete"
