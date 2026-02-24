// ===== APP.JS – Navigation & Animation Lifecycle Controller =====
// Enhanced with anime.js powered UI transitions

import { ChargingFriction } from './animations/charging-friction.js';
import { Electroscope } from './animations/electroscope.js';
import { ChargingInduction } from './animations/charging-induction.js';
import { CoulombsLaw } from './animations/coulombs-law.js';
import { Superposition } from './animations/superposition.js';
import { ElectricField } from './animations/electric-field.js';
import { FieldLines } from './animations/field-lines.js';
import { ElectricFlux } from './animations/electric-flux.js';
import { ElectricDipole } from './animations/electric-dipole.js';
import { DipoleInField } from './animations/dipole-in-field.js';
import { GaussLaw } from './animations/gauss-law.js';
import { InfiniteWire } from './animations/infinite-wire.js';
import { InfinitePlane } from './animations/infinite-plane.js';
import { SphericalShell } from './animations/spherical-shell.js';

// Registry of all animation modules
const ANIMATIONS = {
    'charging-friction': {
        module: ChargingFriction,
        title: 'Charging by Friction',
        description: 'Rub a glass rod with silk to transfer charges. Like charges repel, unlike charges attract.',
        formula: 'Charge transfer: electrons move from one material to another',
        concept: 'When two objects are rubbed together, electrons transfer from one to the other. The object losing electrons becomes positively charged; the one gaining electrons becomes negatively charged.'
    },
    'electroscope': {
        module: Electroscope,
        title: 'Gold-Leaf Electroscope',
        description: 'Detect electric charge by observing the divergence of thin gold leaves inside a glass jar.',
        formula: 'Like charges on leaves → electrostatic repulsion → divergence',
        concept: 'A gold-leaf electroscope detects charge. When a charged body touches the metal knob, charge flows to the leaves, which repel each other and diverge.'
    },
    'charging-induction': {
        module: ChargingInduction,
        title: 'Charging by Induction',
        description: 'Charge a conductor without contact by bringing a charged rod near and grounding.',
        formula: 'Induced charge separation → grounding → net charge acquired',
        concept: 'A charged rod brought near a neutral conductor causes charge separation. If the far side is grounded and the rod is removed, the conductor retains a net charge opposite to the rod.'
    },
    'coulombs-law': {
        module: CoulombsLaw,
        title: "Coulomb's Law",
        description: 'The electrostatic force between two point charges is proportional to the product of charges and inversely proportional to the square of distance.',
        formula: 'F = k · q₁q₂ / r²    where k = 1/(4πε₀) ≈ 9 × 10⁹ N·m²/C²',
        concept: 'Coulomb\'s law gives the magnitude and direction of the electrostatic force between two point charges. The force is along the line joining them, attractive for unlike charges and repulsive for like charges.'
    },
    'superposition': {
        module: Superposition,
        title: 'Superposition Principle',
        description: 'The net force on a charge is the vector sum of forces due to all other individual charges.',
        formula: 'F₁ = F₁₂ + F₁₃ + F₁₄ + …  (vector sum)',
        concept: 'The principle of superposition states that in a system of charges, the force on any one charge equals the vector sum of forces exerted on it by all other charges, each computed independently.'
    },
    'electric-field': {
        module: ElectricField,
        title: 'Electric Field',
        description: 'The electric field at a point is the force per unit positive test charge placed at that point.',
        formula: 'E = F/q₀ = kQ/r²  r̂',
        concept: 'The electric field E at a point is defined as the force experienced by a unit positive test charge placed at that point. For a point charge Q, the field points radially outward (if Q > 0) or inward (if Q < 0).'
    },
    'field-lines': {
        module: FieldLines,
        title: 'Electric Field Lines',
        description: 'Visualize the electric field using continuous curves that show field direction and relative strength.',
        formula: 'Field lines: start on +, end on −. Density ∝ field strength.',
        concept: 'Electric field lines are imaginary curves drawn so that the tangent at any point gives the direction of E. Lines are closer together where the field is stronger. They never cross each other.'
    },
    'electric-flux': {
        module: ElectricFlux,
        title: 'Electric Flux',
        description: 'Electric flux measures the number of field lines passing through a given surface area.',
        formula: 'Φ = E · A · cos θ  =  ∫ E⃗ · dA⃗',
        concept: 'Electric flux through a surface is proportional to the number of field lines crossing it. It depends on the field strength, the area, and the angle between the field and the surface normal.'
    },
    'electric-dipole': {
        module: ElectricDipole,
        title: 'Electric Dipole',
        description: 'A pair of equal and opposite charges separated by a small distance forms a dipole with moment p = q × 2a.',
        formula: 'p⃗ = q · 2a⃗    |   E_axial = 2kp/r³   |   E_equatorial = kp/r³',
        concept: 'An electric dipole consists of +q and −q separated by distance 2a. The dipole moment p⃗ points from −q to +q. The field varies as 1/r³ at large distances.'
    },
    'dipole-in-field': {
        module: DipoleInField,
        title: 'Dipole in Uniform Field',
        description: 'A dipole in a uniform electric field experiences a torque that tends to align it with the field.',
        formula: 'τ⃗ = p⃗ × E⃗  →  τ = pE sin θ',
        concept: 'When placed in a uniform electric field, a dipole experiences no net force but a torque that rotates it to align with the field. The torque is maximum when θ = 90° and zero when aligned.'
    },
    'gauss-law': {
        module: GaussLaw,
        title: "Gauss's Law",
        description: 'The total electric flux through any closed surface equals the net charge enclosed divided by ε₀.',
        formula: 'Φ = ∮ E⃗ · dA⃗ = q_enclosed / ε₀',
        concept: 'Gauss\'s law relates the electric flux through a closed surface (Gaussian surface) to the total charge enclosed. It is particularly useful for calculating fields with high symmetry.'
    },
    'infinite-wire': {
        module: InfiniteWire,
        title: 'Field of Infinite Wire',
        description: 'Use a cylindrical Gaussian surface to find the electric field of an infinitely long charged wire.',
        formula: 'E = λ / (2πε₀r)',
        concept: 'For an infinitely long straight charged wire with linear charge density λ, the electric field points radially outward and varies as 1/r. A cylindrical Gaussian surface exploits the symmetry.'
    },
    'infinite-plane': {
        module: InfinitePlane,
        title: 'Field of Infinite Plane',
        description: 'Use a pill-box Gaussian surface to find the uniform field of an infinite charged plane sheet.',
        formula: 'E = σ / (2ε₀)',
        concept: 'An infinite plane sheet with surface charge density σ produces a uniform electric field on both sides, perpendicular to the sheet. The field is independent of distance from the sheet.'
    },
    'spherical-shell': {
        module: SphericalShell,
        title: 'Spherical Shell',
        description: 'Field outside a charged shell is like a point charge; field inside is zero.',
        formula: 'E(r>R) = kQ/r²   |   E(r<R) = 0',
        concept: 'A uniformly charged thin spherical shell behaves like a point charge for points outside (E = kQ/r²). Inside the shell, the electric field is exactly zero—a remarkable result of Gauss\'s law.'
    }
};

// DOM elements
const canvas = document.getElementById('animCanvas');
const ctx = canvas.getContext('2d');
const titleEl = document.getElementById('animTitle');
const descEl = document.getElementById('animDescription');
const controlsEl = document.getElementById('animControls');
const formulaEl = document.getElementById('formulaCard');
const conceptEl = document.getElementById('conceptCard');
const navItems = document.querySelectorAll('.nav-item');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

let currentAnim = null;
let animFrameId = null;
let isFirstLoad = true;

// ===== ANIME.JS UI ANIMATIONS =====

// Stagger-reveal sidebar nav items on page load
function animateSidebarEntrance() {
    const items = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.nav-section-title');

    // Ensure items are initially hidden (set in CSS)
    // Animate section titles
    if (typeof anime !== 'undefined') {
        anime({
            targets: Array.from(sections),
            opacity: [0, 1],
            translateX: [-10, 0],
            duration: 400,
            delay: function (el, i) { return 80 + i * 60; },
            easing: 'easeOutCubic'
        });

        // Animate nav items with stagger
        anime({
            targets: Array.from(items),
            opacity: [0, 1],
            translateX: [-12, 0],
            duration: 500,
            delay: function (el, i) { return 150 + i * 40; },
            easing: 'easeOutCubic'
        });

        // Animate logo
        anime({
            targets: '.logo-icon',
            scale: [0.5, 1],
            opacity: [0, 1],
            rotate: ['-15deg', '0deg'],
            duration: 600,
            easing: 'easeOutBack'
        });

        anime({
            targets: '.logo h1, .subtitle',
            opacity: [0, 1],
            translateX: [-8, 0],
            duration: 500,
            delay: function (el, i) { return 200 + i * 100; },
            easing: 'easeOutCubic'
        });
    } else {
        // Fallback: just show everything
        items.forEach(item => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        });
    }
}

// Animate header content on animation switch
function animateHeaderTransition() {
    if (typeof anime === 'undefined') return;

    anime({
        targets: '#animTitle',
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 400,
        easing: 'easeOutCubic'
    });

    anime({
        targets: '#animDescription',
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 450,
        delay: 80,
        easing: 'easeOutCubic'
    });

    anime({
        targets: '.anim-controls',
        opacity: [0, 1],
        translateX: [12, 0],
        duration: 400,
        delay: 120,
        easing: 'easeOutCubic'
    });
}

// Animate info panel cards
function animateInfoPanel() {
    if (typeof anime === 'undefined') return;

    anime({
        targets: '#formulaCard',
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 450,
        delay: 100,
        easing: 'easeOutCubic'
    });

    anime({
        targets: '#conceptCard',
        opacity: [0, 1],
        translateY: [16, 0],
        duration: 450,
        delay: 200,
        easing: 'easeOutCubic'
    });
}

// Animate canvas entrance
function animateCanvasEntrance() {
    if (typeof anime === 'undefined') return;

    anime({
        targets: '#animCanvas',
        opacity: [0, 1],
        scale: [0.97, 1],
        duration: 500,
        delay: 50,
        easing: 'easeOutCubic'
    });
}

// Resize canvas to fill container
function resizeCanvas() {
    const wrapper = document.getElementById('canvasWrapper');
    const w = wrapper.clientWidth - 64;
    const h = wrapper.clientHeight - 40;
    canvas.width = Math.min(w, 1200);
    canvas.height = Math.min(h, 700);
    if (currentAnim && currentAnim.resize) {
        currentAnim.resize(canvas.width, canvas.height);
    }
}

// Load an animation
function loadAnimation(key) {
    // Stop current animation
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (currentAnim && currentAnim.destroy) currentAnim.destroy();

    const config = ANIMATIONS[key];
    if (!config) return;

    // Update UI
    titleEl.textContent = config.title;
    descEl.textContent = config.description;
    formulaEl.innerHTML = `<h3>Key Formula</h3><div class="formula">${config.formula}</div>`;
    conceptEl.innerHTML = `<h3>Concept</h3><p>${config.concept}</p>`;
    controlsEl.innerHTML = '';

    // Update nav
    navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.anim === key);
    });

    // Init new animation
    resizeCanvas();
    currentAnim = new config.module(canvas, ctx, controlsEl);

    // Trigger anime.js transitions (skip stagger on first load - sidebar handles it)
    if (!isFirstLoad) {
        animateHeaderTransition();
        animateInfoPanel();
        animateCanvasEntrance();
    } else {
        isFirstLoad = false;
        // On first load, animate everything together
        setTimeout(() => {
            animateHeaderTransition();
            animateInfoPanel();
            animateCanvasEntrance();
        }, 400);
    }

    // Animation loop
    function loop() {
        currentAnim.animate();
        animFrameId = requestAnimationFrame(loop);
    }
    loop();
}

// Event listeners
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        loadAnimation(item.dataset.anim);
        if (window.innerWidth <= 900) sidebar.classList.remove('open');
    });
});

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

window.addEventListener('resize', resizeCanvas);

// Initial load
animateSidebarEntrance();
loadAnimation('charging-friction');
