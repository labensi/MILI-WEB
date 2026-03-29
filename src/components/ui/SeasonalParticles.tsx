import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/themeStore';

export const SeasonalParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme } = useThemeStore();
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    const particleCount = 50;
    const particleColors = {
      spring: ['#ff9a9e', '#fecfef', '#ffd6e0', '#ffe6f0'],
      summer: ['#fad961', '#f76b1c', '#ffd700', '#ffa500'],
      autumn: ['#ff9966', '#ff5e62', '#ff8c42', '#d96c1e'],
      winter: ['#a6c1ee', '#fbc2eb', '#b8e1fc', '#e0f0ff'],
    };

    const colors = particleColors[currentTheme as keyof typeof particleColors] || particleColors.spring;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 1 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.y += particle.speedY;
        particle.x += particle.speedX;

        if (particle.y > canvas.height) {
          particle.y = 0;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;

        ctx.beginPath();
        
        if (currentTheme === 'spring') {
          // Cherry blossom petals
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.7, 0, 0, Math.PI * 2);
        } else if (currentTheme === 'summer') {
          // Sparkles
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        } else if (currentTheme === 'autumn') {
          // Maple leaf shapes
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 72) * Math.PI / 180;
            const x = particle.x + Math.cos(angle) * particle.size;
            const y = particle.y + Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.fill();
        } else {
          // Snowflakes
          ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};
