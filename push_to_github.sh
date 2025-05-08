#!/bin/bash

# Update these variables
GITHUB_TOKEN="[REMOVED]" # Token removed for security
GITHUB_USERNAME="Shafwansafi06"
REPO_NAME="Clock-RL"

# Configure Git
git config --global user.name "$GITHUB_USERNAME"
git config --global user.email "Shafwansafi06@gmail.com"

# Set the remote URL with the token (alternative format)
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# Add any remaining files
git add .

# Commit any changes (skip if everything is already committed)
git commit -m "Add MIT License and update project files" || echo "No changes to commit"

# Push to GitHub
git push -u origin main

echo "Finished pushing to GitHub" 