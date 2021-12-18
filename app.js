(async () => {
  const episodes = 50;
  const gamma = 0.1;
  const decay = 0.1;
  const grid_size = 7;
  const env = new FrozenLake({
    grid_size,
    area_size: 600,
    // total_pits: 40,
  });

  let epsilon = 0.8;
  let episode = 0;

  let qtable = new Array(grid_size * grid_size);
  for (let i = 0; i < qtable.length; i++) qtable[i] = [Math.random(), Math.random(), Math.random(), Math.random()];

  await env.delay(500);
  while (episode < episodes) {
    if (episode == episodes - 1) await env.delay(300);
    else await env.delay(0);

    // choose optimal action
    let state = env.agent_pos;
    let action;
    if (Math.random() < epsilon) action = env.randomAction();
    else action = qtable[state - 1].indexOf(Math.max(...qtable[state - 1]));

    // take action
    let { next_state, reward, total_steps, finished } = env.step(action + 1);

    // train ai
    qtable[state - 1][action] = reward + gamma * Math.max(...qtable[next_state - 1]);

    if (finished) {
      episode += 1;
      epsilon -= decay * epsilon;
      console.log(`Episode ${episode}, steps taken: `, total_steps);
      if (episode == episodes - 1 || episode == episodes) await env.delay(3000);
      else await env.delay(0);
      env.reset();
    }
  }
})();
