import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { NotificationContext } from './notificationContext';
import { createPortal } from 'react-dom';
import useAnimatedClose from '../hooks/useAnimatedClose';

function Toast({ toast, dismiss }) {
  const ref = useRef(null);
  const remove = useCallback(() => dismiss(toast.id), [dismiss, toast.id]);
  const close = useAnimatedClose(ref, remove);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(close, toast.type === 'error' ? 8000 : 5000);
    return () => window.clearTimeout(timer);
  }, [toast, close, paused]);
  const Icon = toast.type === 'success' ? FiCheckCircle : toast.type === 'info' ? FiInfo : FiAlertCircle;
  const color = toast.type === 'success' ? 'text-green-700' : toast.type === 'error' ? 'text-red-700' : toast.type === 'warning' ? 'text-amber-700' : 'text-gray-700';
  return <div ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }} className="toast-enter pointer-events-auto flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
    <Icon className={'mt-0.5 shrink-0 ' + color} size={20} aria-hidden="true" />
    <div className="min-w-0 flex-1"><p className="text-sm leading-6 text-gray-900">{toast.message}</p>{toast.to && <Link to={toast.to} onClick={close} className="mt-1 inline-block text-sm font-medium underline underline-offset-4">{toast.label || 'View'}</Link>}</div>
    <button type="button" onClick={close} aria-label="Dismiss notification" className="-m-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"><FiX size={17} /></button>
  </div>;
}
export default function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [host, setHost] = useState(null);
  const nextId = useRef(0);
  const dismiss = useCallback(id => setToasts(current => current.filter(toast => toast.id !== id)), []);
  const notify = useCallback((message, type = 'success', action = {}) => {
    const toast = { id: ++nextId.current, message, type, ...action };
    setToasts(current => [...current.filter(item => item.message !== message), toast].slice(-3));
  }, []);
  useEffect(() => {
    const offline = () => notify('You are offline. Check your connection before updating your cart or account.', 'warning');
    const online = () => notify('Connection restored.', 'info');
    window.addEventListener('offline', offline);
    window.addEventListener('online', online);
    return () => { window.removeEventListener('offline', offline); window.removeEventListener('online', online); };
  }, [notify]);
  return <NotificationContext.Provider value={{ notify, setHost }}>
    {children}
    {createPortal(<div role="log" aria-label="Notifications" aria-live="polite" aria-relevant="additions" className={'pointer-events-none fixed right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 ' + (host ? 'bottom-28' : 'bottom-4')}>{toasts.map(toast => <Toast key={toast.id} toast={toast} dismiss={dismiss} />)}</div>, host || document.body)}
  </NotificationContext.Provider>;
}
