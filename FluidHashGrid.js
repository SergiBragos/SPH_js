class FluidHashGrid{
  constructor(cellSize){
    this.cellSize = cellSize;
    
    this.hashMap = new Map();
    
    //this.hashMapSize = 100000;
    //this.prime1 = 661401;
    //this.prime2 = 752887;

    this.particles = [];
  }

  initialize(particles){
    this.particles = particles;
  }

  clearGrid(){
    this.hashMap.clear();
  }

  getGridHashFromPos(pos){
    let x = Math.floor(pos.x / this.cellSize);
    let y = Math.floor(pos.y / this.cellSize);

    return this.cellIndexToHash(x,y);
  }

  cellIndexToHash(x,y){
    //let hash = (x * this.prime1 ^ y * this.prime2) % this.hashMapSize;
    let hash = `${x},${y}`;
    return hash;
  }

  getNeighbourOfParticleIdx(i){
    let neighbours = [];
    let pos = this.particles[i].position;

    let particleGridX = Math.floor(pos.x / this.cellSize);
    let particleGridY = Math.floor(pos.y / this.cellSize);

    for(let x = -1; x <= 1; x++){
      for(let y = -1; y <= 1; y++){
        let gridX = particleGridX + x;
        let gridY = particleGridY + y;

        let hashId = this.cellIndexToHash(gridX, gridY);
        let content = this.getContentOffCell(hashId);

        neighbours.push(...content);
      }
    }

    return neighbours;
  }

  getNeighbourOfParticlePosition(position){
    let neighbours = [];
    let pos = position;

    let particleGridX = Math.floor(pos.x / this.cellSize);
    let particleGridY = Math.floor(pos.y / this.cellSize);

    for(let x = -1; x <= 1; x++){
      for(let y = -1; y <= 1; y++){
        let gridX = particleGridX + x;
        let gridY = particleGridY + y;

        let hashId = this.cellIndexToHash(gridX, gridY);
        let content = this.getContentOffCell(hashId);

        neighbours.push(...content);
      }
    }

    return neighbours;
  }

  mapParticlesToCell(){
    for(let i=0; i<this.particles.length; i++){
      let pos = this.particles[i].position;
      let hash = this.getGridHashFromPos(pos);

      let entries = this.hashMap.get(hash);
      if(entries == null){
        let newArray = [this.particles[i]];
        this.hashMap.set(hash, newArray);
      }else{
        entries.push(this.particles[i]);
      }
    }
  }

  getContentOffCell(id){
    let content = this.hashMap.get(id);
    if(content == null){
      return [];
    }else{
      return content;
    }
  }
}