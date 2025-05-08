# Clock-RL Documentation

Welcome to the Clock-RL documentation. This directory contains additional information about the project setup and configuration.

## Documentation Files

- [SETUP.md](SETUP.md) - General setup instructions
- [PUSH_INSTRUCTIONS.md](PUSH_INSTRUCTIONS.md) - Instructions for pushing to GitHub
- [SSH_SETUP.md](SSH_SETUP.md) - SSH configuration for GitHub

## Development Notes

### Project Structure

The project follows a standard React TypeScript structure with the following organization:

- React components are organized by feature and functionality
- Hooks are used for shared logic across components
- Context providers manage global state
- Utility functions handle common operations

### Reinforcement Learning Implementation

The Q-learning algorithm is implemented in the `src/algorithms` directory. The main components are:

1. **State representation**: The user's wake-up patterns and behaviors
2. **Action space**: Adjustments to alarm times (earlier or later)
3. **Reward function**: Based on timeliness of wake-up and snooze behavior
4. **Learning rate**: Controls how quickly the algorithm adapts to new patterns

### Contributing

When contributing to this project, please ensure you follow the established code style and organization patterns. Run tests before submitting pull requests. 