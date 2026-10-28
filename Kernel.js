class Kernel{
  static poly(r, h){
    if(r >= 0 && r < h){
      let h2 = h * h;
      let r2 = r * r;
      let k = 4/(Math.PI * Math.pow(h, 8));
      return k * Math.pow(h2 - r2, 3);
    }
    else{
      return 0;
    }
  }

  static polyGradient(rij, h){
    let r = rij.Length();
    if(r >= 0 && r < h){
      let h2 = h * h;
      let r2 = r * r;
      let k = -24/(Math.PI * Math.pow(h, 8));
      factor = k * Math.pow(h2 - r2, 2);
      return Scale(rij, factor);
    }
    else{
      return Vector2.Zero();
    }    
  }

  static spikyGradient(rij, h){
    let r = rij.Length();
    if (r > 0 && r < h){
      rij.Normalize(); //Adaptem el vector rij a un de longitud 1 per tal que el resultat apunti cap al mateix lloc que el vector distància.
      let factor = -(30 / (Math.PI * Math.pow(h, 5))) * Math.pow(h - r, 2);
      return Scale(rij, factor);
    } else{
      return Vector2.Zero();
    }
  }
}