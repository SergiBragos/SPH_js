class SPHSimulation{
  constructor(){
    this.particles = []
    this.AMOUNT_PARTICLES = 500;
    this.INTERACTION_RADIUS = 20;
    this.REST_DENSITY = 0.003;
    this.K_STIFFNESS = 2;
    this.GAMMA = 7;
    this.K_STIFFNESS_LINEAR = 10;
    //Més paràmetres que afegirem després

    this.instantiateParticles();
  }

  instantiateParticles(){
    let offsetBetweenParticles = 14;
    let offsetAllParticles = new Vector2(400, 150);

    let xparticles = Math.sqrt(this.AMOUNT_PARTICLES);
    let yparticles = xparticles;

    for(let x=0; x<xparticles; x++){
      for(let y=0; y<yparticles; y++){
        let position = new Vector2(x*offsetBetweenParticles + offsetAllParticles.x, y*offsetBetweenParticles + offsetAllParticles.y);
        this.particles.push(new SPHParticle(position)); //Creem una partícula a la llista a la posició inicial calculada
      }
    }

    console.log("Current amount of particles: " + this.particles.length);
  }

  update(){
    this.computeDensityPressure();
  }

  computeDensityPressure(){
    for(let i=0; i < this.particles.length; i++){
      let pi = this.particles[i];
      pi.density = 0;

      for(let j=0; j < this.particles.length; j++){
        if(i==j){
          continue; // TODO: Mirar si està bé que la densitat de la partícula pròpia no computi per al punt on es troba. En teoria per simetria no hauria de canviar res per a la pròpia partícula.
        } else{
          let pj = this.particles[j];
          let rij = Sub(pi.position, pj.position);
          let r = rij.Length();
          pi.density += pj.mass * Kernel.poly(r, this.INTERACTION_RADIUS);
        }
      }
      console.log("Density of particle " + i + ": " + pi.density);

      //Calculem la pressió a partir de la densitat. Per fluids incompressibles un canvi de densitat petit ha de comportar un canvi molt gran de pressió, de forma que la densitat es mantindrà constant a la pràctica.
      let pressure = (this.K_STIFFNESS * this.REST_DENSITY / this.GAMMA) * (Math.pow((pi.density / this.REST_DENSITY), this.GAMMA) - 1); // Si utilitzem l'equació de Tait (pàgina 42)
      //let pressure = this.K_STIFFNESS_LINEAR * (pi.density - this.REST_DENSITY); // Si utilitzem l'equació lineal del Sebastian Lague i pàgina 44.
      pressure = Math.max(pressure, 0);
			pi.pressure = pressure;
      console.log("Pressure of particle " + i + ": " + pi.pressure);
    }
  }

  draw(){
    for(let i=0; i<this.particles.length;i++){
      let pos = this.particles[i].position; //La posició de la partícula "i" de la llita
      DrawUtils.drawPoint(pos, 3, this.particles[i].color);
    }
  }
}