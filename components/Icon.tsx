import React from 'react';

const ICONS = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
    clipboard: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" />,
    car: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-6H3l4 6h10zm-9 4a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4zM3 16V8a2 2 0 012-2h14a2 2 0 012 2v8" />,
    inventory: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />,
    invoice: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21v-4M12 21v-8M16 21v-12" />,
    settings: <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>,
    help: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    sun: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" />,
    moon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    dots: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01" />,
    services: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
    truck: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4zM21 17H17v-4a1 1 0 00-1-1H3V7a2 2 0 012-2h10l4 4v6h-2zM3 17V7" />,
    wallet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    staff: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-3-3h-2.5M17 20a2 2 0 100-4 2 2 0 000 4zM3 20h5v-2a3 3 0 00-3-3H2.5M3 20a2 2 0 100-4 2 2 0 000 4zM12 4a3 3 0 100 6 3 3 0 000-6zM7 14a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2v-2z" />,
    leaf: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.672 11.086C18.887 10.155 20 8.76 20 7c0-2.76-2.24-5-5-5-1.76 0-3.155 1.113-3.914 2.328A5.002 5.002 0 007 2c-2.76 0-5 2.24-5 5 0 1.76 1.113 3.155 2.328 3.914C3.155 12.887 2 14.28 2 16c0 2.76 2.24 5 5 5 1.76 0 3.155-1.113 3.914-2.328A5.002 5.002 0 0016 21c2.76 0 5-2.24 5-5 0-1.72-.887-3.113-2.328-3.914z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12m6-6H6" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />,
    'x-mark': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />,
    'office-building': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-8h1m-1 4h1m-1 4h1" />,
    'chevron-down': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
    'chevron-up': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 15.75l7.5-7.5 7.5 7.5" />,
    'list-bullet': <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
    camera: <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </>,
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    wrench: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 00-1.06-1.06L14.72 9.47a2.25 2.25 0 01-3.182 0L9.47 7.409a2.25 2.25 0 00-3.182 0L2.06 11.64a.75.75 0 001.06 1.06l3.23-3.23a.75.75 0 011.06 0l1.97 1.97a.75.75 0 001.06 0l3.23-3.23a.75.75 0 011.06 0l1.414 1.414a.75.75 0 001.06 0z" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.5 12a7.5 7.5 0 0112.02-5.48M19.5 12a7.5 7.5 0 01-12.02 5.48M4.5 12h4.5M19.5 12h-4.5" />,
    loading: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />,
    tool: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 00-1.06-1.06L14.72 9.47a2.25 2.25 0 01-3.182 0L9.47 7.409a2.25 2.25 0 00-3.182 0L2.06 11.64a.75.75 0 001.06 1.06l3.23-3.23a.75.75 0 011.06 0l1.97 1.97a.75.75 0 001.06 0l3.23-3.23a.75.75 0 011.06 0l1.414 1.414a.75.75 0 001.06 0z" />,
    warning: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
    save: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16V5a2 2 0 00-2-2H9a2 2 0 00-2 2v11l5-3 5 3zM12 3v4" />,
    'exclamation-triangle': <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />,
    'chart-line': <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 16.5h16.5M3.75 12h16.5m-16.5-4.5h16.5M3.75 4.5h16.5" />,
    eye: <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </>,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    'user-plus': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM21 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2m17-10h-2m-2-2v4" />,
    'chevron-right': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />,
    'arrows-right-left': <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h18m-7.5-12L21 9m0 0-4.5 4.5M21 9H3" />,
    barcode: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5v15m3.75-15v15m3.75-15v15m3.75-15v15M20.25 4.5v15" />,
    percentage: <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L15 9m-1.5-5.5a2 2 0 11-4 0 2 2 0 014 0zm-7 7a2 2 0 11-4 0 2 2 0 014 0z" />,
    'credit-card': <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />,
    'logo-car': <path d="M20.8,6.3C20,5.1,18.8,4.2,17.4,4c-1-0.2-2-0.2-3-0.2c-2.3,0-4.6,0.5-6.7,1.4c-2.4,1-4.2,2.8-5,5.2 c-0.5,1.5-0.6,3-0.5,4.5c0.1,1.2,0.4,2.3,0.9,3.4c0.2,0.5,0.5,0.9,0.8,1.3c0,0,0,0,0,0c0.1,0.1,0.1,0.2,0.2,0.3 c0.4,0.4,0.8,0.7,1.3,1c0.1,0.1,0.2,0.1,0.3,0.2c0.3,0.2,0.6,0.3,0.9,0.4c0.1,0,0.2,0.1,0.3,0.1c0.9,0.3,1.8,0.4,2.7,0.4 c1.3,0,2.6-0.2,3.8-0.7c2.1-0.8,3.9-2.2,5.1-4.1c1-1.5,1.6-3.2,1.8-5c0.1-1.1,0-2.2-0.4-3.3C21.2,7.3,21,6.8,20.8,6.3z M16.3,14.1 c-0.6,1-1.5,1.8-2.6,2.3c-1.4,0.6-3,0.8-4.5,0.5c-1.2-0.2-2.3-0.8-3.1-1.6c-0.2-0.2-0.3-0.4-0.4-0.6c-0.1-0.2-0.1-0.3-0.1-0.4 c-0.1-0.4-0.1-0.9,0-1.3c0.2-0.8,0.5-1.6,1-2.3c1.1-1.7,2.8-2.8,4.8-3.2c2.1-0.4,4.2,0,5.9,1.1c0.9,0.6,1.6,1.3,2.2,2.2 C19.6,12,18.4,12.2,16.3,14.1z" strokeWidth="0" fill="currentColor"/>,
    'logo-circle': <path stroke="none" fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm5.66,13.2a.6.6,0,0,1-.5.2H6.84a.6.6,0,0,1-.5-.2.61.61,0,0,1,0-.63l2.83-4.9,2.83-4.9a.6.6,0,0,1,1,0l2.83,4.9,2.83,4.9A.61.61,0,0,1,17.66,15.2Z" />,
    paperclip: <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.687 7.687a1.5 1.5 0 0 0 2.122 2.122l7.687-7.687" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    'chevron-double-left': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />,
    'arrow-left': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />,
    printer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-6-5v-5a2 2 0 00-2-2H8a2 2 0 00-2 2v5m6 5h-4" />,
    'document-text': <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
    'check-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    'x-circle': <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    share: <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 100-2.186m0 2.186c-.18.324-.283.696-.283 1.093s.103.77.283 1.093m0-2.186V10.907" />,
    'paper-airplane': <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />,
    'arrow-trending-up': <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-3.976 5.197m-4.21-4.21l-3.976 5.197" />,
    'arrow-trending-down': <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-3.976-5.197m-4.21 4.21l-3.976-5.197" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.75 3v2.25m10.5-2.25v2.25m-10.5 0L6.75 21h10.5l.75-15.75m-10.5 0h10.5M4.5 9h15M4.5 9V21A2.25 2.25 0 006.75 23.25h10.5A2.25 2.25 0 0019.5 21V9A2.25 2.25 0 0017.25 6.75H6.75A2.25 2.25 0 004.5 9z" />,
};

export type IconName = keyof typeof ICONS;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  title?: string;
}

export const Icon: React.FC<IconProps> = ({ name, title, ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            {...props}
        >
            {title && <title>{title}</title>}
            {ICONS[name]}
        </svg>
    );
};