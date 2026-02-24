// ===== Animation 13: Viruses =====

export class Viruses {
    constructor(canvas, ctx, controlsEl) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.t = 0;
        this.type = 'bacteriophage'; // bacteriophage, tmv

        controlsEl.innerHTML = `
            <label>Virus Type:
                <select id="virusType" class="control-select">
                    <option value="bacteriophage">Bacteriophage (Infects Bacteria)</option>
                    <option value="tmv">Tobacco Mosaic Virus (Infects Plants)</option>
                </select>
            </label>
            <div class="control-static mt-2">Viruses are obligate intracellular parasites consisting of genetic material enclosed in a protein coat.</div>
        `;
        document.getElementById('virusType').addEventListener('change', (e) => {
            this.type = e.target.value;
            this.reset();
        });
        this.reset();
    }

    reset() {
        this.t = 0;
        this.particles = [];
        // For bacteriophage infection animation
        this.infectionStage = 0; // 0: approaching, 1: landed, 2: injecting, 3: replicating, 4: lysing
        this.phageY = -150;
        this.dnaY = 0;
        this.newPhages = [];
    }

    resize(w, h) { }

    animate() {
        const { ctx, canvas } = this;
        const W = canvas.width, H = canvas.height;
        const cx = W / 2, cy = H / 2;

        ctx.clearRect(0, 0, W, H);
        this.drawGrid(ctx, W, H);
        this.t += 0.02;

        ctx.save();
        ctx.translate(cx, cy);

        if (this.type === 'bacteriophage') {
            this.drawBacteriophageInfection(ctx, W, H);
        } else {
            this.drawTMV(ctx);
        }

        ctx.restore();
    }

    drawBacteriophageInfection(ctx, W, H) {
        // Draw Bacterial Cell (Host)
        ctx.fillStyle = '#1e293b'; // Dark blue-grey cell
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 10;

        let cellBurst = this.infectionStage === 4;

        ctx.beginPath();
        if (cellBurst) {
            // Lysed cell
            ctx.moveTo(-150, 50); ctx.lineTo(-100, 100); ctx.lineTo(-150, 150);
            ctx.moveTo(150, 50); ctx.lineTo(100, 100); ctx.lineTo(150, 150);
            ctx.moveTo(-50, 50); ctx.lineTo(0, 80); ctx.lineTo(50, 50);
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = 'bold 20px Space Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText('Lysis (Cell Bursts)', 0, 150);
        } else {
            // Intact cell
            ctx.roundRect(-150, 50, 300, 150, 20);
            ctx.fill(); ctx.stroke();

            // Bacterial DNA
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < Math.PI * 2; i += 0.1) {
                let r = 30 + Math.sin(i * 10 + this.t) * 5;
                let x = Math.cos(i) * r;
                let y = 120 + Math.sin(i) * r;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath(); ctx.stroke();
        }

        // Animation Logic
        if (this.infectionStage === 0) {
            this.phageY += 1;
            if (this.phageY >= 5) { this.phageY = 5; this.infectionStage = 1; }
        } else if (this.infectionStage === 1) {
            if (this.t > 3) this.infectionStage = 2; // Wait a bit
        } else if (this.infectionStage === 2) {
            this.dnaY += 1;
            if (this.dnaY >= 80) { this.infectionStage = 3; this.t = 0; }
        } else if (this.infectionStage === 3) {
            if (this.newPhages.length < 5 && Math.random() < 0.05) {
                this.newPhages.push({ x: (Math.random() - 0.5) * 200, y: 100 + (Math.random() - 0.5) * 50, scale: 0 });
            }
            this.newPhages.forEach(p => { if (p.scale < 0.3) p.scale += 0.01; });
            if (this.t > 5) this.infectionStage = 4;
        } else if (this.infectionStage === 4) {
            this.newPhages.forEach(p => {
                p.y -= 2;
                p.x += (Math.random() - 0.5) * 2;
            });
            if (this.t > 8) this.reset();
        }

        // Draw infecting phage (if not burst)
        if (!cellBurst) {
            ctx.save();
            ctx.translate(0, this.phageY); // 5 is landed on cell
            this.drawPhage(ctx, 1.0, this.infectionStage >= 2 ? this.dnaY : 0, this.infectionStage >= 2);
            ctx.restore();

            ctx.fillStyle = '#cbd5e1';
            ctx.font = '16px Space Grotesk';
            ctx.textAlign = 'center';
            let status = ['1. Attachment', '2. Penetration', '3. Injection of DNA', '4. Replication inside host', ''][this.infectionStage];
            ctx.fillText(status, 0, -180);
        }

        // Draw new phages
        this.newPhages.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            this.drawPhage(ctx, p.scale, 0, false);
            ctx.restore();
        });
    }

    drawPhage(ctx, scale, dnaOffset, isEmpty) {
        ctx.scale(scale, scale);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#94a3b8'; // Protein coat (Capsid)
        ctx.fillStyle = '#334155';

        // Tail pins & fibers
        ctx.beginPath();
        // Left fiber
        ctx.moveTo(-10, 50); ctx.lineTo(-30, 70); ctx.lineTo(-40, 90);
        // Right fiber
        ctx.moveTo(10, 50); ctx.lineTo(30, 70); ctx.lineTo(40, 90);
        // Base plate pins
        ctx.moveTo(-15, 50); ctx.lineTo(-20, 60);
        ctx.moveTo(15, 50); ctx.lineTo(20, 60);
        ctx.stroke();

        // Base plate
        ctx.fillRect(-15, 45, 30, 5);

        // Core/Sheath (Contractile)
        let sheathLen = 30;
        if (dnaOffset > 0 && dnaOffset < 80) sheathLen = 15; // Contracted

        ctx.fillRect(-5, 15, 10, sheathLen);
        // Sheath rings
        ctx.beginPath();
        for (let y = 15; y < 15 + sheathLen; y += 3) {
            ctx.moveTo(-8, y); ctx.lineTo(8, y);
        }
        ctx.stroke();

        // Head (Capsid - icosahedral)
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-20, -10);
        ctx.lineTo(-20, 10);
        ctx.lineTo(0, 15);
        ctx.lineTo(20, 10);
        ctx.lineTo(20, -10);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Capsid facets
        ctx.beginPath();
        ctx.moveTo(-20, -10); ctx.lineTo(20, -10);
        ctx.moveTo(-20, 10); ctx.lineTo(20, 10);
        ctx.moveTo(0, -30); ctx.lineTo(0, 15);
        ctx.stroke();

        // Viral DNA (Red)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (!isEmpty) {
            // DNA inside head
            for (let i = 0; i < 20; i++) {
                let x = Math.sin(i * 2) * 10;
                let y = -20 + i;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
        }

        if (dnaOffset > 0) {
            // DNA traveling down/out
            for (let i = 0; i < 20; i++) {
                let x = Math.sin(i * 2) * 5 + (dnaOffset > 45 ? Math.sin(this.t * 10) * 10 : 0); // Wiggle when entering cell
                let y = -20 + i + dnaOffset; // Moves down
                ctx.moveTo(x, y); ctx.lineTo(x, y + 1);
            }
        }
        ctx.stroke();
    }

    drawTMV(ctx) {
        // Tobacco Mosaic Virus (Helical structure)
        ctx.rotate(-Math.PI / 6); // Tilt

        let length = 300;
        let radius = 40;

        // Shadow/Glow
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 20;

        // Draw the RNA coil (extends out top)
        ctx.strokeStyle = '#ef4444'; // Red RNA
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (let y = -length / 2 - 50; y < length / 2; y += 2) {
            // Inner coil
            let x = Math.sin(y * 0.2 + this.t) * 15;
            if (y === -length / 2 - 50) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw Capsomeres (Protein subunits forming helical capsid)
        ctx.shadowBlur = 0;
        for (let y = -length / 2; y < length / 2; y += 8) {
            for (let a = 0; a < Math.PI; a += Math.PI / 6) {
                // Offset angle based on y to create helix
                let angle = a + y * 0.1 + this.t;

                // Only draw front facing ones to fake 3D
                if (Math.sin(angle) > -0.2) {
                    let cx = Math.cos(angle) * radius;
                    let cy = y;

                    let depth = Math.sin(angle);

                    // Capsomere shape (Grape-like)
                    ctx.fillStyle = `rgb(34, 197, 94)`; // Base green
                    // Darken edges slightly
                    if (depth < 0.5) ctx.fillStyle = `rgb(22, 163, 74)`;

                    ctx.strokeStyle = '#14532d';
                    ctx.lineWidth = 1;

                    ctx.beginPath();
                    ctx.ellipse(cx, cy, 10, 6, 0, 0, Math.PI * 2);
                    ctx.fill(); ctx.stroke();

                    // Highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.beginPath(); ctx.arc(cx - 3, cy - 2, 2, 0, Math.PI * 2); ctx.fill();
                }
            }
        }

        ctx.rotate(Math.PI / 6); // Undo tilt for text
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 18px Space Grotesk';
        ctx.textAlign = 'center';
        ctx.fillText('Tobacco Mosaic Virus (TMV)', 150, -50);

        ctx.fillStyle = '#ccc';
        ctx.font = '14px Space Grotesk';
        ctx.textAlign = 'left';
        ctx.fillText('• Single-stranded RNA (Red coil)', 50, -20);
        ctx.fillText('• Protein coat (Capsid) made of capsomeres (Green)', 50, 0);
        ctx.fillText('• Arranged in a helical structure', 50, 20);
    }

    drawGrid(ctx, W, H) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    }

    destroy() { }
}
