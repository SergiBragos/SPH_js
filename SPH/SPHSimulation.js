class SPHSimulation{
  constructor(){
    
    this.particles = []
    this.AMOUNT_PARTICLES = 600;
    this.DELTA_TIME = 0.1;

    //Propietats de les partícules
    this.INTERACTION_RADIUS = 20; // = 20
    this.REST_DENSITY = 0.005; // = 0.003
    this.K_STIFFNESS = 2; //Només útil si es fa servir fórmula de pressió de Tait. = 2
    this.GAMMA = 7; //Només útil si es fa servir fórmula de pressió de Tait. = 7
    this.K_STIFFNESS_LINEAR = 10; // Només útil si es fa servir fórmula de pressió lineal
    this.XSPH_EPSILON = 0.8 //Coeficient de viscositat. = 0.2

    this.VELOCITY_DAMPING = 1; //Paràmetre que resta velocitat al càlcul per extreure energia al sistema. Mantenir a 1 si es vol ignorar.
    this.REBOUND_COEFF = 0.5;
    //Més paràmetres que afegirem després
    this.GRAVITY = new Vector2(0, 0.05);

    this.instantiateParticles();
    //this.instantiateBoundaryParticles();
  }

  instantiateParticles(){
    let offsetBetweenParticles = 14;
    let offsetAllParticles = new Vector2(14, 50);

    let xparticles = Math.sqrt(this.AMOUNT_PARTICLES);
    let yparticles = xparticles;

    for(let x=0; x<xparticles; x++){
      for(let y=0; y<yparticles; y++){
        let position = new Vector2(x*offsetBetweenParticles + offsetAllParticles.x, y*offsetBetweenParticles + offsetAllParticles.y);
        this.particles.push(new SPHParticle(position)); //Creem una partícula a la llista a la posició inicial calculada
      }
    }

    //console.log("Current amount of particles: " + this.particles.length);
  }

	instantiateBoundaryParticles(){
		let offsetBetweenParticles = 10;
		// paret inferior
		for(let x=0; x<canvas.width; x+=offsetBetweenParticles){
			this.particles.push(new SPHParticle(new Vector2(x,canvas.height)));
			this.particles[this.particles.length-1].isBoundary = true;
		}
    // paret superior
		for(let x=0; x<canvas.width; x+=offsetBetweenParticles){
			this.particles.push(new SPHParticle(new Vector2(x,0)));
			this.particles[this.particles.length-1].isBoundary = true;
		}
		// paret esquerra
		for(let y=0; y<canvas.height; y+=offsetBetweenParticles){
			this.particles.push(new SPHParticle(new Vector2(0,y)));
			this.particles[this.particles.length-1].isBoundary = true;
		}
		// paret dreta
		for(let y=0; y<canvas.height; y+=offsetBetweenParticles){
			this.particles.push(new SPHParticle(new Vector2(canvas.width,y)));
			this.particles[this.particles.length-1].isBoundary = true;
		}
	}

  update(){
    this.computeDensityPressure(); //Calculem la pressió estàtica a tots els punts on hi ha una partícula.
    this.computeForces(); //Calculem les forces de pressió entre les parelles de partícules.
    this.applyXSPH(); //Calculem la força de viscositat per diferències de velocitat.
    this.integrate(); //Calculem les noves velocitats i posicions de les partícules.
    this.worldBoundary(); //Calculem rebots amb les parets.
    //Després de totes aquestes sub-funcions es crida la funció draw des del main. Draw només agafa les posicions noves de les partícules.
  }

  computeDensityPressure(){
    for(let i=0; i < this.particles.length; i++){
      let pi = this.particles[i];
      pi.density = 0;

      for(let j=0; j < this.particles.length; j++){
        let pj = this.particles[j];
        let rij = Sub(pi.position, pj.position);
        let r = rij.Length();
        pi.density += pj.mass * Kernel.poly(r, this.INTERACTION_RADIUS);
      }
      //console.log("Density of particle " + i + ": " + pi.density);

      //Calculem la pressió a partir de la densitat. Per fluids incompressibles un canvi de densitat petit ha de comportar un canvi molt gran de pressió, de forma que la densitat es mantindrà constant a la pràctica.
      let pressure = (this.K_STIFFNESS * this.REST_DENSITY / this.GAMMA) * (Math.pow((pi.density / this.REST_DENSITY), this.GAMMA) - 1); // Si utilitzem l'equació de Tait (pàgina 42)
      //let pressure = this.K_STIFFNESS_LINEAR * (pi.density - this.REST_DENSITY); // Si utilitzem l'equació lineal del Sebastian Lague i pàgina 44.
      pressure = Math.max(pressure, 0);
			pi.pressure = pressure;
      //console.log("Pressure of particle " + i + ": " + pi.pressure);
    }
  }

  computeForces(){
    for(let i = 0; i < this.particles.length; i++){
      let pi = this.particles[i];
      pi.force = Vector2.Zero();

      for(let j = 0; j < this.particles.length; j++){
        let pj = this.particles[j];

        if(pi !== pj){
          let rij = Sub(pi.position, pj.position);
          let r = rij.Length();

          if(r > 0){
            //Calculem el vector força que genera el gradient de pressió (escalar --> vector)!
            let pressureTerm = - pj.mass * (pi.pressure + pj.pressure) / (2 * pj.density);
            let spikyGradient = Kernel.spikyGradient(rij, this.INTERACTION_RADIUS);
            let pressureForce = Scale(spikyGradient, pressureTerm);
            pi.force = Add(pi.force, pressureForce);
          }
        }
      }
      // Sumem la força de la gravetat al final de cada partícula
      pi.force = Add(pi.force, this.GRAVITY);
    }
  }

  applyXSPH(){
    for(let i = 0; i < this.particles.length; i++){
      let pi = this.particles[i];
      if(pi.isBoundary) continue;
      let deltaV = Vector2.Zero();

      for(let j = 0; j < this.particles.length; j++){
        let pj = this.particles[j];
        let rij = Sub(pj.position, pi.position);
        let r = rij.Length();

        if(r < this.INTERACTION_RADIUS){
          let W = Kernel.poly(r, this.INTERACTION_RADIUS);
          let density = (pi.density + pj.density) / 2.0;
          let contribution = Scale(Sub(pj.velocity, pi.velocity), (pj.mass / density) * W);
          deltaV = Add(deltaV, contribution);
        }
      }
      pi.velocity = Add(pi.velocity, Scale(deltaV, this.XSPH_EPSILON));
    }
  }

  integrate(){
		for(let i = 0; i < this.particles.length; i++){
			let pi = this.particles[i];

      if(pi.isBoundary) continue; //Serveix per què les partícules de la paret no siguin mòbils.

			let acceleration = Scale(pi.force, 1.0/pi.density);
			pi.velocity = Add(pi.velocity, Scale(acceleration, this.DELTA_TIME));
			pi.velocity = Scale(pi.velocity, this.VELOCITY_DAMPING);
			pi.position = Add(pi.position, Scale(pi.velocity, this.DELTA_TIME));
		}
	}

  worldBoundary(){
		// Rebotar amb la peixera
		for(let i = 0; i < this.particles.length;i++){
			let pi = this.particles[i];
			if(pi.position.x > canvas.width){
				pi.position.x = canvas.width-1;
				pi.velocity.x *= -this.REBOUND_COEFF;
			}

			if(pi.position.x < 0){
				pi.position.x = 1;
				pi.velocity.x *= -this.REBOUND_COEFF;
			}

			if(pi.position.y > canvas.height){
				pi.position.y = canvas.height-1;
				pi.velocity.y *= -this.REBOUND_COEFF;
			}

			if(pi.position.y < 0){
				pi.position.y = 1;
				pi.velocity.y *= -this.REBOUND_COEFF;
			}

			// make sure particles stay in the world
			pi.position.x = Math.max(0, Math.min(canvas.width, pi.position.x));
			pi.position.y = Math.max(0, Math.min(canvas.height, pi.position.y));
		}
	}

  draw(){
    for(let i=0; i<this.particles.length;i++){
      let pos = this.particles[i].position; //La posició de la partícula "i" de la llita
      if(this.particles[i]. isBoundary){
        DrawUtils.drawPoint(pos, 3, "#3e3e3e");

      }else{
        DrawUtils.drawPoint(pos, 3, this.particles[i].color);
      }
    }
  }
}