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
    pit_color = "#708090",
    total_pits = 0,
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
    this.pit_color = pit_color;

    // define environment variables
    this.action_space = [1, 2, 3, 4]; // [left, right, up, down]
    this.max_grids = this.grid_size * this.grid_size;
    this.target_pos = target_pos ? target_pos : this.randomPosition();
    this.size = this.area_size - this.border_width;
    this.initial_agent_pos = agent_pos;
    this.total_steps = 0;
    this.canvas = document.querySelector("canvas");
    this.canvas.width = this.area_size;
    this.canvas.height = this.area_size;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.translate(this.border_width / 2, this.border_width / 2);
    // this.pits = [
    //   11, 12, 13, 14, 15, 16, 17, 18, 19, 32, 33, 34, 35, 36, 37, 38, 39, 40, 51, 52, 53, 54, 55, 56, 57, 58, 59, 72,
    //   73, 74, 75, 76, 77, 78, 79, 80, 91, 92, 93, 94, 95, 96, 97, 98, 99,
    // ];
    this.pits = [];
    for (let i = 0; i < total_pits; i++) {
      let pit_pos = this.randomPosition();
      if (pit_pos == this.agent_pos || pit_pos == this.target_pos) i--;
      else this.pits.push(pit_pos);
    }
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
    this.pits.forEach((pit_pos) => this.drawBox(pit_pos, this.pit_color));
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
    let next_state = this.agent_pos;
    let reward = 0;
    let done = false;
    let finished = false;

    // calculate new agent position
    switch (action) {
      case 1:
        if (next_state % this.grid_size != 1) next_state -= 1;
        break;
      case 2:
        if (next_state % this.grid_size != 0) next_state += 1;
        break;
      case 3:
        next_state -= this.grid_size;
        break;
      case 4:
        next_state += this.grid_size;
        break;
    }

    if (next_state < 1 || next_state > this.max_grids || this.pits.includes(next_state)) {
      next_state = this.agent_pos;
    } else if (next_state == this.target_pos) {
      finished = true;
      reward = 1;
    }

    this.agent_pos = next_state;
    this.paint({ success: finished });
    return { next_state, reward, done, total_steps: this.total_steps, finished };
  }

  activateManualControls() {
    let actions = ["left", "right", "up", "down"];
    window.addEventListener("keydown", (e) => {
      if (e.key.includes("Arrow")) {
        let action = actions.indexOf(e.key.split("Arrow")[1].toLowerCase()) + 1;
        this.step(action);
      }
    });
  }

  delay(time) {
    return new Promise((res) => setTimeout(res, time));
  }
}
