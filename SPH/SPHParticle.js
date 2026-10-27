class SPHParticle{
  constructor(position, mass = 1, color = "#28b0ff"){
    this.position = position //És un vector 2D
    this.velocity = Vector2.Zero();
    this.density = 0;
    this.pressure = 0;
    this.mass = mass;
    this.force = Vector2.Zero();
    this.color = color;
  }
}