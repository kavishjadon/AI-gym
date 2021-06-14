class FrozenLake {
  constructor({
    grid_size = 5,
    area_size = 500,
    agent_pos = 1,
    target_pos = null,
    border_width = 10,
    border_color = "#dddddd",
    agent_color = "#ff1493",
    target_color = "#1e90ff",
    success_color = "#3cb371",
  }) {
    // initialize constructor
    this.grid_size = grid_size;
    this.area_size = area_size;
    this.agent_pos = agent_pos;
    this.target_pos = target_pos;
    this.border_width = border_width;
    this.border_color = border_color;
    this.agent_color = agent_color;
    this.target_color = target_color;
    this.success_color = success_color;

    // define environment variables
    this.action_space = ["left", "up", "right", "down"];
    this.target_pos = target_pos ? target_pos : this.grid_size * this.grid_size - this.grid_size + 1;
    this.size = this.area_size - this.border_width;
    this.max_grids = this.grid_size * this.grid_size;
    this.initial_agent_pos = agent_pos;
    this.total_steps = 0;
    this.canvas = document.querySelector("canvas");
    this.canvas.width = this.area_size;
    this.canvas.height = this.area_size;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(this.border_width / 2, this.border_width / 2);
    this.paint();
  }

  reset(pos) {
    this.agent_pos = pos ? pos : this.initial_agent_pos;
    this.paint({ reset: true });
  }

  paint(args = { reset: false, success: false }) {
    this.ctx.clearRect(0, 0, this.size, this.size);
    this.drawGrid();
    if (args.reset) this.total_steps = 0;
    this.drawBox(this.agent_pos, this.agent_color);
    this.drawBox(this.target_pos, args.success ? this.success_color : this.target_color);
  }

  getCoordinates(pos) {
    let row = Math.ceil(pos / this.grid_size) - 1;
    let col = pos % this.grid_size == 0 ? this.grid_size - 1 : (pos % this.grid_size) - 1;
    return { row, col };
  }

  drawGrid() {
    let lineLength = this.size;
    let sectionSize = this.size / this.grid_size;
    this.ctx.lineWidth = this.border_width;
    this.ctx.strokeStyle = this.border_color;
    this.ctx.lineCap = "round";
    this.ctx.beginPath();

    // draw horizontal lines
    for (let y = 0; y < this.grid_size + 1; y++) {
      this.ctx.moveTo(0, y * sectionSize);
      this.ctx.lineTo(lineLength, y * sectionSize);
    }

    // draw vertical lines
    for (let x = 0; x < this.grid_size + 1; x++) {
      this.ctx.moveTo(x * sectionSize, 0);
      this.ctx.lineTo(x * sectionSize, lineLength);
    }
    this.ctx.stroke();
  }

  drawBox(pos, box_color) {
    let { row, col } = this.getCoordinates(pos);
    let boxSize = this.size / this.grid_size;
    this.ctx.fillStyle = box_color;
    this.ctx.fillRect(
      col * boxSize + this.border_width / 2,
      row * boxSize + this.border_width / 2,
      this.size / this.grid_size - this.border_width,
      this.size / this.grid_size - this.border_width
    );
  }

  minStepsToTarget() {
    let { row: agentRow, col: agentCol } = this.getCoordinates(this.initial_agent_pos);
    let { row: targetRow, col: targetCol } = this.getCoordinates(this.target_pos);
    return Math.abs(targetRow - agentRow) + Math.abs(targetCol - agentCol);
  }

  randomAction() {
    return this.action_space[Math.floor(Math.random() * this.action_space.length)];
  }

  randomPosition() {
    return Math.floor(Math.random() * this.max_grids + 1);
  }

  step(action) {
    this.total_steps += 1;
    let new_state = this.agent_pos;
    let reward = 0;
    let done = false;
    // calculate new agent position
    switch (action) {
      case "left":
        if (new_state % this.grid_size != 1) new_state -= 1;
        else reward = -5;
        break;
      case "right":
        if (new_state % this.grid_size != 0) new_state += 1;
        else reward = -5;
        break;
      case "up":
        new_state -= this.grid_size;
        break;
      case "down":
        new_state += this.grid_size;
        break;
    }

    if (new_state < 1 || new_state > this.max_grids) {
      new_state = this.agent_pos;
      reward = -5;
    } else if (new_state == this.target_pos) {
      done = true;
      let minSteps = this.minStepsToTarget();
      reward = (minSteps / this.total_steps) * 100;
    }
    this.agent_pos = new_state;
    let finished = this.agent_pos == this.target_pos;
    this.paint({ success: finished });
    return { next_state: new_state, reward, done, info: { target_reached: finished, total_steps: this.total_steps } };
  }

  activateManualControls() {
    window.addEventListener("keydown", (e) => {
      if (e.key.includes("Arrow")) this.step(e.key.split("Arrow")[1].toLowerCase());
    });
  }

  delay(time) {
    return new Promise((res) => setTimeout(res, time));
  }
}
