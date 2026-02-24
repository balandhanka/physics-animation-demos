// ===== Animation 7: Slime Moulds =====

export class SlimeMoulds {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.state = 'feeding'; // feeding -> aggregating -> fruiting -> spores
        this.spores = [];
        this.plasmodium = { x: 0, y: 0, points: [] };

        controlsEl.innerHTML = `
            <div class="control-btn" id="btnSlimeState">Trigger Adverse Conditions</div>
            <div class="control-static mt-2" id="slimeStatus">State: Feeding (Plasmodium spreading)</div>
        `;
        document.getElementById('btnSlimeState').addEventListener('click', () => {
            this.advanceState();
        });
        this.reset();
    }

    advanceState() {
        const btn = document.getElementById('btnSlimeState');
        const status = document.getElementById('slimeStatus');

        if (this.state === 'feeding') {
            this.state = 'aggregating';
            btn.textContent = 'Form Fruiting Bodies';
            status.textContent = 'State: Adverse conditions → Aggregating to form fruiting bodies';
        } else if (this.state === 'aggregating') {
            this.state = 'fruiting';
            btn.textContent = 'Release Spores';
            status.textContent = 'State: Fruiting bodies formed';
        } else if (this.state === 'fruiting') {
            this.state = 'spores';
            btn.textContent = 'Reset Environment';
            status.textContent = 'State: Spores dispersed by air currents';
            this.initSpores();
        } else {
            this.state = 'feeding';
            btn.textContent = 'Trigger Adverse Conditions';
            status.textContent = 'State: Favorable conditions → Feeding (Plasmodium spreading)';
            this.reset();
        }
    }

    reset() {
        this.t = 0;
        this.spores = [];

        // Initial spreading plasmodium (yellow slime network)
        this.plasmodium.points = [];
        const numPoints = 60;
        for (let i = 0; i < numPoints; i++) {
            this.plasmodium.points.push({
                angle: (i / numPoints) * Math.PI * 2,
                radius: 50 + Math.random() * 30,
                baseRadius: 50 + Math.random() * 30,
                growthPhase: Math.random() * Math.PI * 2,
                growthSpeed: 0.1 + Math.random() * 0.2
            });
        }
    }

    initSpores() {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        for (let i = 0; i < 100; i++) {
            this.spores.push({
                x: cx + (Math.random() - 0.5) * 100,
                y: cy - 100 + (Math.random() - 0.5) * 50,
                vx: (Math.random() - 0.5) * 5,
                vy: -Math.random() * 5 - 2,
                life: 1.0
            });
        }
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);

        // Background: Forest floor (decaying logs/leaves)
        let gradient = ctx.createLinearGradient(0, H / 2, 0, H);
        gradient.addColorStop(0, '#1c1917'); // Dark stone
        gradient.addColorStop(1, '#292524'); // Decaying matter
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);

        // Draw a decaying log
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 50, 300, 80, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#271000';
        ctx.lineWidth = 5;
        // Bark texture
        for (let i = -250; i < 250; i += 40) {
            ctx.beginPath(); ctx.moveTo(cx + i, cy + 10);
            ctx.quadraticCurveTo(cx + i + 20, cy + 50, cx + i - 10, cy + 120);
            ctx.stroke();
        }

        this.t += 0.02;

        ctx.save();
        ctx.translate(cx, cy + 50);

        // State machine logic for Plasmodium drawing
        if (this.state === 'feeding') {
            this.drawPlasmodium(ctx, 1.0, true);
        }
        else if (this.state === 'aggregating') {
            // Shrink radius
            this.plasmodium.points.forEach(p => {
                if (p.radius > 30) p.radius -= 0.5;
            });
            this.drawPlasmodium(ctx, 1.0, false);

            // Start forming stalk
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            let stalkHeight = 100 - this.plasmodium.points[0].radius;
            if (stalkHeight > 0) {
                ctx.rect(-10, -stalkHeight, 20, stalkHeight);
                ctx.fill();
            }
        }
        else if (this.state === 'fruiting' || this.state === 'spores') {
            // Drawn small base
            this.plasmodium.points.forEach(p => p.radius = 20);
            this.drawPlasmodium(ctx, 0.5, false);

            // Draw full stalks and sporangia
            ctx.fillStyle = '#eab308';
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 4;

            // Main stalk
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -120);
            ctx.stroke();

            // Sporangium (fruiting body head)
            if (this.state === 'fruiting' || this.t % 2 < 1) { // Flicker if empty
                ctx.fillStyle = '#422006'; // Dark spore color inside
                ctx.beginPath();
                ctx.arc(0, -120, 25, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            } else {
                // Empty sporangium sac
                ctx.strokeStyle = 'rgba(202, 138, 4, 0.5)';
                ctx.beginPath();
                ctx.arc(0, -120, 25, Math.PI, 0);
                ctx.stroke();
            }

            // Side stalks
            ctx.beginPath(); ctx.moveTo(-10, -60); ctx.lineTo(-40, -90); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(10, -80); ctx.lineTo(50, -110); ctx.stroke();

            ctx.fillStyle = '#422006';
            if (this.state === 'fruiting' || this.t % 2 < 1) {
                ctx.beginPath(); ctx.arc(-40, -90, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.beginPath(); ctx.arc(50, -110, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            }
        }

        ctx.restore();

        // Draw spores if released
        if (this.state === 'spores') {
            ctx.fillStyle = '#292524'; // Very resistant true walls
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 1;

            this.spores.forEach((s, i) => {
                s.x += s.vx + Math.sin(this.t * 5 + i) * 1;
                s.y += s.vy;
                s.life -= 0.002;

                if (s.life > 0) {
                    ctx.save();
                    ctx.globalAlpha = s.life;
                    ctx.translate(s.x, s.y);
                    ctx.beginPath();
                    ctx.arc(0, 0, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    ctx.restore();
                }
            });

            ctx.fillStyle = '#ccc';
            ctx.font = '16px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Spores possess true walls and are highly resistant, dispersed by air currents.', cx, H - 30);
        }
    }

    drawPlasmodium(ctx, opacity, isGrowing) {
        ctx.fillStyle = `rgba(253, 224, 71, ${opacity})`; // Yellow slime
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        this.plasmodium.points.forEach((p, i) => {
            if (isGrowing && p.radius < 250) {
                // Spread outwards in veins
                p.radius += p.growthSpeed * Math.sin(this.t + p.growthPhase);
                if (p.radius < 10) p.radius = 10;
            }

            const r = p.radius + Math.sin(this.t * 3 + p.growthPhase) * 5;
            const x = Math.cos(p.angle) * r;
            const y = Math.sin(p.angle) * r * 0.4; // Flatten for perspective

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();

        // Inner vein network
        if (isGrowing) {
            ctx.strokeStyle = `rgba(202, 138, 4, ${opacity * 0.5})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < this.plasmodium.points.length; i += 5) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const p = this.plasmodium.points[i];
                const x = Math.cos(p.angle) * p.radius;
                const y = Math.sin(p.angle) * p.radius * 0.4;
                ctx.quadraticCurveTo(x / 2 + Math.sin(this.t) * 20, y / 2, x, y);
                ctx.stroke();
            }
        }

        ctx.shadowBlur = 0;
    }

    destroy() { }
}
