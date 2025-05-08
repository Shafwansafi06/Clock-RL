# GitHub SSH Setup Instructions

I've generated an SSH key for you and set up the SSH configuration. To complete the setup, follow these steps:

## 1. Add your SSH key to GitHub:

Copy the following SSH public key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINQ+8zDNNAXFi5fkJmbMviMhBBF8N8RmOonlCE4k2wiH Shafwansafi06@gmail.com
```

1. Go to [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
2. Click "New SSH key"
3. Give it a title (e.g., "Clock-RL Dev Machine")
4. Paste the key above in the "Key" field
5. Click "Add SSH key"

## 2. Update your Git remote to use SSH:

Run this command in your terminal:

```bash
git remote set-url origin git@github.com:Shafwansafi06/Clock-RL.git
```

## 3. Test the SSH connection:

```bash
ssh -T git@github.com
```

You might see a warning about the authenticity of the host. Type "yes" to continue.
If you see a message like "Hi Shafwansafi06! You've successfully authenticated...", your SSH setup is working.

## 4. Push your repository:

```bash
git push -u origin main
```

This method is more secure and doesn't require token authentication for each push. 