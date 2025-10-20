#!/bin/bash
# Backup script for NAMAS Architecture data
echo "🔄 Creating data backup..."
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r ./persistent-data/* "$BACKUP_DIR/"
echo "✅ Backup created in $BACKUP_DIR"
