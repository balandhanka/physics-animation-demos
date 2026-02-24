// ===== Animation 6: Euglenoids =====

export class Euglenoids {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.mode = 'sunlight'; // sunlight (autotrophic), dark (heterotrophic)
        this.organisms = [];
        this.foodParticles = [];

        controlsEl.innerHTML = `
            <div class="control-btn" id="btnEuglenaLight">Toggle Sunlight / Darkness</div>
            <div class="control-static mt-2" id="euglenaStatus">Current Mode: Photosynthetic (Autotrophic)</div>
        `;
        document.getElementById('btnEuglenaLight').addEventListener('click', () => {
            this.mode = this.mode === 'sunlight' ? 'dark' : 'sunlight';
            const statusText = this.mode === 'sunlight'
                ? 'Photosynthetic (Autotrophic) - Using chloroplasts'
                : 'Predatory (Heterotrophic) - Engulfing smaller organisms';
            document.getElementById('euglenaStatus').textContent = `Current Mode: ${statusText}`;
        });

        this.reset();
    }

    reset() {
        this.t = 0;
        this.organisms = [
            {
                x: this.canvas.width / 2, y: this.canvas.height / 2, vx: 0, vy: 0,
                angle: 0, bodyPhase: 0
            } // Main large organism
        ];
        this.foodParticles = [];
        for (let i = 0; i < 15; i++) {
            this.addFood();
        }
    }

    addFood() {
        this.foodParticles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5),
            vy: (Math.random() - 0.5),
            radius: 2 + Math.random() * 2,
            active: true
        });
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        this.t += 0.02;

        // Background based on light mode
        if (this.mode === 'sunlight') {
            let gradient = ctx.createLinearGradient(0, 0, 0, H);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e3a8a'); // Lighter blue water
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, W, H);

            // Sunbeams
            ctx.fillStyle = 'rgba(255, 255, 200, 0.05)';
            ctx.beginPath();
            ctx.moveTo(cx - 200, 0); ctx.lineTo(cx + 200, 0);
            ctx.lineTo(cx + W / 2 + Math.sin(this.t) * 100, H);
            ctx.lineTo(cx - W / 2 + Math.cos(this.t) * 100, H);
            ctx.fill();
        } else {
            ctx.fillStyle = '#020617'; // Very dark
            ctx.fillRect(0, 0, W, H);
        }

        // Handle Food particles (smaller organisms)
        this.foodParticles.forEach((f, i) => {
            if (!f.active) {
                this.foodParticles.splice(i, 1);
                this.addFood();
                return;
            }

            f.x += f.vx;
            f.y += f.vy;
            if (f.x < 0 || f.x > W) f.vx *= -1;
            if (f.y < 0 || f.y > H) f.vy *= -1;

            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        // Main organism
        let euglena = this.organisms[0];

        // Movement behavior depends on mode
        if (this.mode === 'sunlight') {
            // Swim towards light (upwards mostly)
            euglena.vy += (-0.5 - euglena.vy) * 0.05;
            euglena.vx += (Math.sin(this.t) * 0.5 - euglena.vx) * 0.05;
            // Point upwards
            let targetAngle = -Math.PI / 2 + Math.sin(this.t) * 0.2;
            euglena.angle += (targetAngle - euglena.angle) * 0.05;
        } else {
            // Hunt food
            let nearest = null;
            let minD = Infinity;
            this.foodParticles.forEach(f => {
                let d = Math.hypot(euglena.x - f.x, euglena.y - f.y);
                if (d < minD) { minD = d; nearest = f; }
            });

            if (nearest) {
                let dx = nearest.x - euglena.x;
                let dy = nearest.y - euglena.y;
                let targetAngle = Math.atan2(dy, dx);

                // Smooth angle interpolation
                let diff = targetAngle - euglena.angle;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                euglena.angle += diff * 0.05;

                euglena.vx += (Math.cos(euglena.angle) * 2 - euglena.vx) * 0.1;
                euglena.vy += (Math.sin(euglena.angle) * 2 - euglena.vy) * 0.1;

                // Eat
                if (minD < 30) nearest.active = false;
            }
        }

        euglena.x += euglena.vx;
        euglena.y += euglena.vy;
        euglena.bodyPhase += Math.hypot(euglena.vx, euglena.vy) * 0.1;

        // Wraparound
        if (euglena.x > W + 50) euglena.x = -50;
        if (euglena.x < -50) euglena.x = W + 50;
        if (euglena.y > H + 50) euglena.y = -50;
        if (euglena.y < -50) euglena.y = H + 50;

        ctx.save();
        ctx.translate(euglena.x, euglena.y);
        ctx.rotate(euglena.angle);

        this.drawEuglena(ctx, euglena);

        ctx.restore();

        // Diagram labels
        ctx.fillStyle = '#ccc';
        ctx.font = '16px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Euglenoids lack a cell wall. They have a protein-rich flexible layer called a pellicle.', cx, H - 30);
    }

    drawEuglena(ctx, euglena) {
        ctx.scale(1.5, 1.5);

        // Shape changes due to flexible pellicle
        let stretch = Math.sin(euglena.bodyPhase) * 5;

        // Base color shifts slightly based on mode
        let r = this.mode === 'sunlight' ? 34 : 100; // More green vs more brown/grey
        let g = this.mode === 'sunlight' ? 197 : 150;
        let b = this.mode === 'sunlight' ? 94 : 100;

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.strokeStyle = `rgb(${r * 0.6}, ${g * 0.6}, ${b * 0.6})`;
        ctx.lineWidth = 1;

        // The pellicle body (spindle-shaped but flexible)
        ctx.beginPath();
        ctx.moveTo(30 + stretch, 0); // Anterior (front - right side in this coord system)
        ctx.quadraticCurveTo(10, -20 - stretch / 2, -15, -15); // Top curve
        ctx.quadraticCurveTo(-40 - stretch, -5, -45 - stretch, 0); // Posterior (tail)
        ctx.quadraticCurveTo(-40 - stretch, 5, -15, 15); // Bottom curve
        ctx.quadraticCurveTo(10, 20 + stretch / 2, 30 + stretch, 0);
        ctx.fill();
        ctx.stroke();

        // Pellicle striations (lines)
        ctx.beginPath();
        for (let i = -10; i <= 10; i += 4) {
            ctx.moveTo(25 + stretch, i * 0.8);
            ctx.quadraticCurveTo(0, i * 1.5, -40 - stretch, i * 0.2);
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.stroke();

        // Chloroplasts (visible mainly in sunlight)
        if (this.mode === 'sunlight') {
            ctx.fillStyle = '#16a34a'; // Dark green
            let pos = [{ x: 0, y: -8 }, { x: -15, y: -5 }, { x: -10, y: 8 }, { x: 5, y: 10 }, { x: -25, y: 0 }];
            pos.forEach(p => {
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, 6, 3, Math.PI / 4, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Nucleus
        ctx.fillStyle = '#fbbf24'; // Yellow center
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.stroke();

        // Photoreceptor / Eyespot (Stigma) - detects light
        ctx.fillStyle = '#ef4444'; // Red
        ctx.beginPath();
        ctx.arc(20 + stretch, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Flagella (arising from anterior pocket)
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;

        // Long prominent flagellum
        ctx.beginPath();
        ctx.moveTo(30 + stretch, 0);
        let fx = 30 + stretch;
        let fy = 0;
        for (let i = 0; i < 40; i++) {
            fx += 2;
            // Wavy motion pulling the organism forward
            fy += Math.sin(this.t * 15 - i * 0.2) * 1.5;
            ctx.lineTo(fx, fy);
        }
        ctx.stroke();

        // Short invisible/vestigial flagellum (contained within pocket)
        ctx.beginPath();
        ctx.moveTo(25 + stretch, 2);
        ctx.lineTo(30 + stretch, 3);
        ctx.stroke();
    }

    destroy() { }
}
