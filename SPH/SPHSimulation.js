class SPHSimulation{
  constructor(){
    this.particles = []
    this.AMOUNT_PARTICLES = 500;
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

  }

  draw(){
    for(let i=0; i<this.particles.length;i++){
      let pos = this.particles[i].position; //La posició de la partícula "i" de la llita
      DrawUtils.drawPoint(pos, 3, this.particles[i].color);
    }
  }
}