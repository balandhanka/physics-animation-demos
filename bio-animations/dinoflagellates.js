// ===== Animation 5: Dinoflagellates =====

export class Dinoflagellates {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.isRedTide = false;
        this.cells = [];

        controlsEl.innerHTML = `
            <div class="control-btn" id="btnRedTide">Trigger Red Tide (Multiplication)</div>
            <div class="control-static mt-2">Observe the two flagella: one longitudinal, one transverse.</div>
        `;
        document.getElementById('btnRedTide').addEventListener('click', () => {
            this.isRedTide = !this.isRedTide;
            document.getElementById('btnRedTide').textContent = this.isRedTide ? 'Stop Red Tide' : 'Trigger Red Tide (Multiplication)';
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.isRedTide = false;
        this.cells = [];

        // Start with a few cells
        for (let i = 0; i < 3; i++) {
            this.addCell();
        }
    }

    addCell(x, y) {
        if (this.cells.length > 150) return; // Cap

        this.cells.push({
            x: x !== undefined ? x : Math.random() * this.canvas.width,
            y: y !== undefined ? y : Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            phase: Math.random() * Math.PI * 2,
            scale: 0.5 + Math.random() * 0.5,
            colorMod: Math.random(), // For slight color variations
            age: 0
        });
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas, t } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        this.t += 0.02;

        // Background color shifts if Red Tide
        let targetBg = this.isRedTide ? [100, 10, 20] : [10, 30, 60];
        // Smooth transition (simplified for frame-by-frame)
        if (!this.bgColors) this.bgColors = [10, 30, 60];
        this.bgColors[0] += (targetBg[0] - this.bgColors[0]) * 0.02;
        this.bgColors[1] += (targetBg[1] - this.bgColors[1]) * 0.02;
        this.bgColors[2] += (targetBg[2] - this.bgColors[2]) * 0.02;

        ctx.fillStyle = `rgb(${Math.floor(this.bgColors[0])}, ${Math.floor(this.bgColors[1])}, ${Math.floor(this.bgColors[2])})`;
        ctx.fillRect(0, 0, W, H);

        // Water particles
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        for (let i = 0; i < 50; i++) {
            ctx.beginPath();
            ctx.arc(
                (Math.sin(i * 74.5 + t * 0.2) * W / 2 + cx + W * 2) % W,
                (Math.cos(i * 31.2 + t * 0.3) * H / 2 + cy + H * 2) % H,
                1 + (i % 2), 0, Math.PI * 2
            );
            ctx.fill();
        }

        // Handle red tide multiplication
        if (this.isRedTide && Math.random() < 0.1 && this.cells.length < 150) {
            // Pick a random existing cell to divide
            let parent = this.cells[Math.floor(Math.random() * this.cells.length)];
            this.addCell(parent.x + (Math.random() - 0.5) * 40, parent.y + (Math.random() - 0.5) * 40);
        }

        // If not red tide, slowly kill off excess cells
        if (!this.isRedTide && this.cells.length > 5 && Math.random() < 0.05) {
            this.cells.pop();
        }

        ctx.save();

        this.cells.forEach(c => {
            c.age += 0.01;

            // Movement (spinning motion typical of dinoflagellates - "dinos" = whirling)
            c.x += c.vx + Math.cos(t * 3 + c.phase) * 1.5;
            c.y += c.vy + Math.sin(t * 3 + c.phase) * 1.5;
            c.rot += 0.02 + c.rotSpeed; // Always whirling slightly

            // Wrap around
            if (c.x > W + 50) c.x = -50;
            if (c.x < -50) c.x = W + 50;
            if (c.y > H + 50) c.y = -50;
            if (c.y < -50) c.y = H + 50;

            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);

            // Pop-in animation for new cells
            let s = c.scale * Math.min(1, c.age * 5);
            ctx.scale(s, s);

            this.drawDinoflagellate(ctx, c);

            ctx.restore();
        });

        ctx.restore();

        if (this.isRedTide) {
            ctx.fillStyle = '#fca5a5';
            ctx.font = 'bold 24px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('WARNING: TOXIC RED TIDE (Gonyaulax bloom)', cx, 50);
            ctx.font = '14px Space Grotesk';
            ctx.fillText('Rapid multiplication causes water to look red and releases toxins.', cx, 80);
        } else {
            ctx.fillStyle = '#ccc';
            ctx.font = '16px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Dinoflagellates have stiff cellulose plates and "whirling" flagella movement.', cx, H - 30);
        }
    }

    drawDinoflagellate(ctx, c) {
        // Color varies from yellow-green to brown to red
        let r = 180 + c.colorMod * 75;
        let g = 80 + c.colorMod * 100;
        let b = 40;

        if (this.isRedTide) {
            r = 220 + c.colorMod * 35;
            g = 40 + c.colorMod * 40;
            b = 40;
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.strokeStyle = `rgb(${r * 1.2}, ${g * 1.2}, ${b * 1.2})`;
        ctx.lineWidth = 2;

        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.shadowBlur = 10;

        // Draw the armored plates (Cellulose)
        // Upper hemisphere (Epitheca)
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.quadraticCurveTo(0, -50, 20, 0);
        ctx.fill();
        ctx.stroke();

        // Lower hemisphere (Hypotheca) - often has horns
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        ctx.lineTo(-25, 40);
        ctx.lineTo(-5, 10);
        ctx.lineTo(20, 45);
        ctx.lineTo(20, 0);
        ctx.fill();
        ctx.stroke();

        // Draw plate lines
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(255,255,255,0.3)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Upper plates
        ctx.moveTo(0, -40); ctx.lineTo(-10, -10);
        ctx.moveTo(0, -40); ctx.lineTo(10, -10);
        ctx.moveTo(-20, -5); ctx.lineTo(20, -5);
        // Lower plates
        ctx.moveTo(-10, 10); ctx.lineTo(-20, 30);
        ctx.moveTo(10, 10); ctx.lineTo(15, 30);
        ctx.stroke();

        // The Transverse Groove (Girdle)
        ctx.fillStyle = `rgb(${r * 0.6}, ${g * 0.6}, ${b * 0.6})`;
        ctx.fillRect(-22, -2, 44, 4);

        // Flagella
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;

        // 1. Transverse flagellum (wraps around the groove)
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += 0.2) {
            let fx = ~~(Math.cos(i) * 25);
            let fy = ~~(Math.sin(i) * 5) + Math.sin(this.t * 10 + c.phase + i) * 2;
            if (i === 0) ctx.moveTo(fx, fy);
            else ctx.lineTo(fx, fy);
        }
        ctx.stroke();

        // 2. Longitudinal flagellum (trailing)
        ctx.beginPath();
        ctx.moveTo(0, 10);
        for (let i = 0; i < 40; i += 4) {
            ctx.lineTo(
                Math.sin(this.t * 8 + c.phase + i * 0.2) * 8,
                10 + i
            );
        }
        ctx.stroke();
    }

    destroy() { }
}
