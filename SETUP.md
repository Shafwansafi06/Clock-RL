# Clock-RL

To push this repository to GitHub, please follow these steps:

## Option 1: HTTPS (Username/Password)

1. Create a new repository on GitHub named 'Clock-RL'
2. Run the following commands in your terminal:

```bash
git remote add origin https://github.com/Shafwansafi06/Clock-RL.git
git push -u origin main
```

## Option 2: SSH (Recommended)

1. Create a new repository on GitHub named 'Clock-RL'
2. Set up SSH keys if you haven't already: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
3. Run the following commands:

```bash
git remote add origin git@github.com:Shafwansafi06/Clock-RL.git
git push -u origin main
```

## Option 3: GitHub CLI

If you have GitHub CLI installed, you can create and push to a repository with:

```bash
# Install GitHub CLI if not installed
# sudo apt install gh

# Authenticate with GitHub
gh auth login

# Create repo and push
gh repo create Clock-RL --public --source=. --remote=origin --push
```

If you encounter permission issues, you may need to use the GitHub web interface to upload the files.
