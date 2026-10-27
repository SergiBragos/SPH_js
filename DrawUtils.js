class DrawUtils{
  static drawPoint(position, radiu, color){
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, Math.Pi*2, true);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }
  static drawText(position, size, color, text){
    ctx.font = size+"px Arial"
    ctx.fillStyle = color;
    ctx.fillText(text, position.x, position.y);
  }
}