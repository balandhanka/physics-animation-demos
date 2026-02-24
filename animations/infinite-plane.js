// ===== Animation 13: Field of Infinite Plane =====
export class InfinitePlane {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.sigma = 5;
        controlsEl.innerHTML = `
            <label>σ: <input type="range" id="ipS" min="1" max="10" value="5">
                <span id="ipSVal">5</span></label>`;
        document.getElementById('ipS').addEventListener('input', (e) => {
            this.sigma = parseInt(e.target.value);
            document.getElementById('ipSVal').textContent = this.sigma;
        });
    }
    resize() { }
    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;
        ctx.clearRect(0, 0, W, H);
        this.t += 0.016;
        // Grid
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        // Plane
        ctx.fillStyle = 'rgba(239,68,68,0.08)'; ctx.fillRect(cx - 4, 0, 8, H);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
        for (let y = 15; y < H; y += 30) {
            ctx.beginPath(); ctx.arc(cx, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill();
            ctx.fillStyle = '#fff'; ctx.font = 'bold 5px Space Grotesk'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('+', cx, y);
        }
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#ef4444'; ctx.font = '12px Space Grotesk'; ctx.textAlign = 'center';
        ctx.fillText('∞ Plane (σ)', cx, 30);
        // Pill-box
        const pW = 160, pH = 120;
        ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(34,197,94,0.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx + pW / 2, cy, pH / 2, pH * 0.15, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx - pW / 2, cy, pH / 2, pH * 0.15, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - pW / 2, cy - pH / 2); ctx.lineTo(cx + pW / 2, cy - pH / 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - pW / 2, cy + pH / 2); ctx.lineTo(cx + pW / 2, cy + pH / 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(34,197,94,0.03)'; ctx.fillRect(cx - pW / 2, cy - pH / 2, pW, pH);
        ctx.fillStyle = '#22c55e'; ctx.font = '11px Space Grotesk'; ctx.textAlign = 'center';
        ctx.fillText('Gaussian Pill-box', cx, cy - pH / 2 - 12);
        // E arrows
        const aLen = 20 + this.sigma * 6, pulse = 1 + 0.08 * Math.sin(this.t * 3);
        for (let i = 0; i < 6; i++) {
            const ay = cy - pH / 2 + 10 + i * (pH / 5) * 0.9;
            this.drawArrow(ctx, cx + pW / 2, ay, cx + pW / 2 + aLen * pulse, ay, '#818cf8', 2);
            this.drawArrow(ctx, cx - pW / 2, ay, cx - pW / 2 - aLen * pulse, ay, '#818cf8', 2);
        }
        ctx.fillStyle = '#818cf8'; ctx.font = 'bold 14px Space Grotesk';
        ctx.textAlign = 'left'; ctx.fillText('E⃗', cx + pW / 2 + aLen + 10, cy);
        ctx.textAlign = 'right'; ctx.fillText('E⃗', cx - pW / 2 - aLen - 10, cy);
        // dA arrows
        this.drawArrow(ctx, cx + pW / 2, cy - pH / 4, cx + pW / 2 + 25, cy - pH / 4, '#f59e0b', 1.5);
        this.drawArrow(ctx, cx - pW / 2, cy - pH / 4, cx - pW / 2 - 25, cy - pH / 4, '#f59e0b', 1.5);
        ctx.fillStyle = '#f59e0b'; ctx.font = '10px Space Grotesk';
        ctx.textAlign = 'left'; ctx.fillText('dA⃗', cx + pW / 2 + 28, cy - pH / 4 + 4);
        ctx.textAlign = 'right'; ctx.fillText('dA⃗', cx - pW / 2 - 28, cy - pH / 4 + 4);
        // Notes
        ctx.fillStyle = '#999'; ctx.font = '10px Space Grotesk'; ctx.textAlign = 'center';
        ctx.fillText('E ⊥ dA on curved → 0 flux  |  E ∥ dA on caps → all flux', cx, cy + pH / 2 + 25);
        ctx.fillStyle = '#818cf8'; ctx.font = '16px JetBrains Mono';
        ctx.fillText('E = σ / (2ε₀)', cx, H - 55);
        ctx.fillStyle = '#22c55e'; ctx.font = 'bold 13px Space Grotesk';
        ctx.fillText('E is independent of distance from the plane!', cx, H - 30);
    }
    drawArrow(ctx, x1, y1, x2, y2, color, w) {
        const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
        ctx.strokeStyle = color; ctx.lineWidth = w; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - h * Math.cos(a - 0.4), y2 - h * Math.sin(a - 0.4));
        ctx.lineTo(x2 - h * Math.cos(a + 0.4), y2 - h * Math.sin(a + 0.4));
        ctx.closePath(); ctx.fill();
    }
    destroy() { }
}
