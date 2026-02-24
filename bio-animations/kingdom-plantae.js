// ===== Animation 11: Kingdom Plantae =====

export class KingdomPlantae {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;

        controlsEl.innerHTML = `
            <div class="control-static">Alternation of Generations: The life cycle alternates between a diploid sporophyte and a haploid gametophyte.</div>
        `;
        this.reset();
    }

    reset() {
        this.t = 0;
        this.particles = []; // Spores/Gametes traveling the cycle
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.t += 0.02;

        ctx.save();
        ctx.translate(cx, cy);

        // Draw the cycle diagram
        this.drawCycle(ctx);

        // Spawn traveling particles
        if (Math.random() < 0.05) {
            // Start from Sporophyte (Meiosis -> Spores)
            this.particles.push({
                angle: -Math.PI / 2,
                type: 'spore',
                speed: 0.02
            });
        }

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.angle += p.speed;

            // State changes along the circle
            if (p.angle > 0 && p.type === 'spore') p.type = 'gametophyte';
            if (p.angle > Math.PI / 2 && p.type === 'gametophyte') p.type = 'gametes';
            if (p.angle > Math.PI && p.type === 'gametes') p.type = 'zygote';
            if (p.angle > Math.PI * 1.5 && p.type === 'zygote') p.type = 'sporophyte';

            if (p.angle > Math.PI * 1.5 + 0.5) { // Completed cycle
                this.particles.splice(i, 1);
                continue;
            }

            let r = 180;
            let px = Math.cos(p.angle) * r;
            let py = Math.sin(p.angle) * r;

            ctx.beginPath();
            if (p.type === 'spore' || p.type === 'gametes') {
                ctx.fillStyle = '#fde047'; // Yellow hue (haploid cells)
                ctx.arc(px, py, 4, 0, Math.PI * 2);
            } else {
                ctx.fillStyle = '#4ade80'; // Green hue (plant bodies)
                ctx.arc(px, py, 6 + Math.sin(this.t * 10) * 2, 0, Math.PI * 2);
            }
            ctx.fill();
        }

        ctx.restore();
    }

    drawCycle(ctx) {
        const r = 180;

        // Background division line
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(-250, -250);
        ctx.lineTo(250, 250);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.font = '14px Space Grotesk';
        ctx.textAlign = 'right';
        ctx.fillText('Diploid (2n) Phase', -150, 200);
        ctx.textAlign = 'left';
        ctx.fillText('Haploid (n) Phase', 150, -200);

        // Circle track
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();

        // 4 Key Nodes
        const nodes = [
            { angle: -Math.PI / 2, label: 'Sporophyte (2n)', desc: 'Producing plant body', color: '#16a34a', is2n: true }, // Top
            { angle: 0, label: 'Spores (n)', desc: 'Meiosis', color: '#facc15', is2n: false }, // Right
            { angle: Math.PI / 2, label: 'Gametophyte (n)', desc: 'Sex organs bearing body', color: '#4ade80', is2n: false }, // Bottom
            { angle: Math.PI, label: 'Zygote (2n)', desc: 'Syngamy (Fertilization)', color: '#059669', is2n: true } // Left
        ];

        nodes.forEach(node => {
            let x = Math.cos(node.angle) * r;
            let y = Math.sin(node.angle) * r;

            // Node circle
            ctx.fillStyle = node.color;
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Text
            ctx.fillStyle = node.is2n ? '#6ee7b7' : '#fef08a';
            ctx.font = 'bold 16px Space Grotesk';
            ctx.textAlign = 'center';

            let ty = y + (y > 0 ? 35 : (y === 0 ? -15 : -25));
            let tx = x + (x > 0 ? 50 : (x < 0 ? -50 : 0));
            if (node.angle === Math.PI) tx -= 20;
            if (node.angle === 0) tx += 20;

            ctx.fillText(node.label, tx, ty);

            ctx.fillStyle = '#ccc';
            ctx.font = '12px Space Grotesk';
            ctx.fillText(node.desc, tx, ty + 15);
        });

        // Draw Arrows
        ctx.strokeStyle = '#22c55e';
        ctx.fillStyle = '#22c55e';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
            let ax = Math.cos(a + Math.PI / 4) * r;
            let ay = Math.sin(a + Math.PI / 4) * r;

            ctx.save();
            ctx.translate(ax, ay);
            ctx.rotate(a + Math.PI / 4 + Math.PI / 2); // Tangent
            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(10, 0);
            ctx.lineTo(-5, -5);
            ctx.lineTo(-5, 5);
            ctx.fill();
            ctx.restore();
        }
    }

    destroy() { }
}
