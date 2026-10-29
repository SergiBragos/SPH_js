class SPHParticle{
  constructor(position, mass = 1, color = "#28b0ff"){
    this.position = position //És un vector 2D
    this.velocity = Vector2.Zero();
    this.density = 0;
    this.pressure = 0;
    this.mass = mass;
    this.force = Vector2.Zero();
    this.color = color;
    this.defaultColor = color;
    this.isBoundary = false;

    //Paràmetres de la tensió superficial
    this.colorField = 0;
    this.surfaceNormal = Vector2.Zero();

    //Per a la representació dels paràmetres.
    this.pressureForce = Vector2.Zero();
    this.viscosityDeltaVelocity = Vector2.Zero();
  }
}