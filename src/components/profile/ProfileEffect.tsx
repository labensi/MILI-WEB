import React, { useEffect, useRef } from 'react';

interface ProfileEffectProps {
  effectId: number;
  children: React.ReactNode;
}

export const ProfileEffect: React.FC<ProfileEffectProps> = ({ effectId, children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (effectId === 1) return; // No effect
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
    }> = [];

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create particles based on effect
    const particleCount = effectId === 4 ? 30 : 20;
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
        
        if (effectId === 2) {
          // Floating stars
          ctx.fillStyle = `rgba(255, 255, 0, ${particle.opacity})`;
          for (let i = 0; i < 5; i++) {
            const angle = (i * 72) * Math.PI / 180;
            const x = particle.x + Math.cos(angle) * particle.size;
            const y = particle.y + Math.sin(angle) * particle.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.fill();
        } else if (effectId === 3) {
          // Rising bubbles
          ctx.fillStyle = `rgba(173, 216, 230, ${particle.opacity})`;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effectId === 4) {
          // Sakura petals
          ctx.fillStyle = `rgba(255, 182, 193, ${particle.opacity})`;
          ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (effectId === 5) {
          // Glittering confetti
          ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, ${particle.opacity})`;
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    if (effectId !== 1) {
      animate();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [effectId]);

  if (effectId === 1) {
    return <>{children}</>;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{ opacity: 0.6 }}
      />
      <div className="relative z-0">{children}</div>
    </div>
  );
};
