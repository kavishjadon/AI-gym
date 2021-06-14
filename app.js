const playGameRandom = async ({ total_episodes }) => {
  let env = new FrozenLake({});
  let episodes = 0;
  let totalRewardAccumulated = 0;
  while (episodes < total_episodes) {
    let { done, reward } = env.step(env.randomAction());
    await env.delay(0); // time in ms
    totalRewardAccumulated += reward;
    if (done) {
      episodes += 1;
      env.reset();
    }
  }
  return { episodes, totalRewardAccumulated };
};

const playGameAI = async ({ total_episodes, grid_size, gamma = 0.9 }) => {
  const qtable = Array.from(
    Array.from({ length: grid_size * grid_size }, () => ({ left: 0, down: 0, right: 0, up: 0 }))
  );

  const getAction = (state) => {
    let currState = qtable[state - 1];
    let maxQValue = Math.max(...Object.values(currState));
    let actions = Object.keys(currState).filter((action) => {
      return currState[action] == maxQValue;
    });
    return { action: actions[Math.floor(Math.random() * actions.length)], qValue: maxQValue };
  };

  const train = ({ state, next_state, reward, action }) => {
    if (state == grid_size * grid_size) return;
    let newQValue = reward + gamma * getAction(next_state).qValue;
    qtable[state - 1][action] = newQValue;
  };

  let env = new FrozenLake({ grid_size, target_pos: Math.floor(Math.random() * grid_size * grid_size + 1) });
  let episodes = 0;
  let totalRewardAccumulated = 0;
  while (episodes < total_episodes) {
    if (episodes == total_episodes - 1) await env.delay(300);
    else await env.delay(0); // time in ms
    let state = env.agent_pos;
    let { action } = getAction(state);
    let { next_state, done, reward, info } = env.step(action);
    train({ state, next_state, reward, action });
    totalRewardAccumulated += reward;
    if (done) {
      console.log({ ...info, episode_no: episodes });
      episodes += 1;
      if (episodes == total_episodes - 1 || episodes == total_episodes) await env.delay(3000);
      env.reset();
    }
  }
  return { episodes, totalRewardAccumulated, qtable };
};

(async () => {
  let res = await playGameAI({ total_episodes: 100, grid_size: 7 });
  console.log(res);
})();
