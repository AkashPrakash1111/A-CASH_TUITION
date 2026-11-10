// Draws one teacher annotation (pen stroke, tick/cross, mark badge, sticky
// comment) on a canvas. Shared by the marking studio, the student's viewer and
// the corrected-PDF export so all three look identical.
export function drawAnnotationItem(ctx, item) {
  ctx.save();
  if (item.type === "stroke") {
    if (!item.points || item.points.length < 2) {
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (item.isHighlighter) ctx.globalAlpha = 0.4;
    ctx.moveTo(item.points[0].x, item.points[0].y);
    for (let i = 1; i < item.points.length; i += 1) ctx.lineTo(item.points[i].x, item.points[i].y);
    ctx.stroke();
  } else if (item.type === "stamp") {
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (item.stampType === "check") {
      ctx.fillStyle = "#10b981";
      ctx.fillText("✓", item.x, item.y);
    } else if (item.stampType === "cross") {
      ctx.fillStyle = "#ef4444";
      ctx.fillText("✗", item.x, item.y);
    } else if (item.stampType === "mark") {
      ctx.fillStyle = item.color || "#0284c7";
      ctx.beginPath();
      ctx.roundRect(item.x - 24, item.y - 14, 48, 28, 8);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(item.value, item.x, item.y);
    }
  } else if (item.type === "comment") {
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#fef08a";
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 1.5;
    const textWidth = Math.max(120, ctx.measureText(item.text).width + 20);
    ctx.beginPath();
    ctx.roundRect(item.x, item.y, textWidth, 40, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#854d0e";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(item.text, item.x + 10, item.y + 20);
  }
  ctx.restore();
}
