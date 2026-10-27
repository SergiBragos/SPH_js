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
}