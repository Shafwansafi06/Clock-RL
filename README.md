# Clock-RL: Self-tuning Alarm Clock

A smart alarm clock application that uses reinforcement learning (Q-learning) to adjust alarm times based on your wake-up patterns.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

<p align="center">
  <img src="public/logo192.png" alt="Clock-RL Logo" width="120">
</p>

## 🚀 Features

- **Self-tuning alarms**: The app learns from your behavior and adjusts alarm times automatically
- **Visual adjustments**: See how much the algorithm has adjusted your alarms compared to your original settings
- **Snooze management**: Configure snooze intervals and limits for each alarm
- **Learning dashboard**: View statistics about your wake-up patterns and how the system is learning
- **Beautiful UI**: Modern, responsive interface with smooth animations

## 🧠 How It Works

1. Set up alarms with your desired wake-up times
2. When an alarm rings, dismiss it or snooze
3. The app records your actual wake-up time and uses it to calculate rewards
4. The Q-learning algorithm adjusts future alarm times based on your patterns
5. Over time, the system learns your optimal wake-up schedule

## 🔧 Technologies Used

- React
- TypeScript
- Q-learning for reinforcement learning
- Styled Components
- Framer Motion for animations
- React Icons

## 📋 Project Structure

```
clock-rl/
├── public/               # Static files
├── src/
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   ├── context/          # React context providers
│   ├── algorithms/       # Q-learning implementation
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main app component
├── docs/                 # Project documentation
└── package.json          # Dependencies and scripts
```

## 🚀 Installation and Setup

```bash
# Clone the repository
git clone https://github.com/Shafwansafi06/Clock-RL.git

# Navigate to the project directory
cd Clock-RL

# Install dependencies
npm install

# Start the development server
npm start
```

## 📊 Learning Algorithm

Clock-RL uses Q-learning, a type of reinforcement learning algorithm that learns to make decisions by trying different actions and evaluating their outcomes. The system:

- Learns from your wake-up behavior
- Adjusts alarms earlier or later as needed
- Considers factors like snooze frequency
- Optimizes for timely wake-ups

## 🔜 Future Improvements

- Sound customization for alarms
- Sleep quality tracking integration
- Dark/light theme options
- Multiple profiles for different users
- Weekly and monthly sleep pattern reports

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 