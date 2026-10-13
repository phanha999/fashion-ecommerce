import { useCallback, useEffect, useRef } from 'react';

// Keep overlays mounted through their exit animation so focus and scroll restore afterwards.
export default function useAnimatedClose(ref, onClose, direction = 'down') {
  const animation = useRef(null);
  useEffect(() => () => animation.current?.cancel(), []);
  return useCallback(() => {
    if (animation.current) return;
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onClose(); return; }
    const transform = direction === 'left' ? 'translateX(-100%)' : direction === 'right' ? 'translateX(100%)' : 'translateY(12px)';
    const exit = element.animate([{ opacity: 1, transform: 'translate(0)' }, { opacity: direction === 'down' ? 0 : 1, transform }], { duration: 180, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    animation.current = exit;
    exit.finished.then(() => { onClose(); }).catch(() => {});
  }, [ref, onClose, direction]);
}
