import React, { useEffect } from 'react';

export default function Toast({
    show,
    message,
    type = 'success',
    onClose
}) {

    useEffect(() => {

        if (!show) return;

        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);

    }, [show]);

    if (!show) return null;

    return (
        <div className="
            fixed top-6 left-1/2
            -translate-x-1/2
            z-[999]
            animate-fade-in-down
        ">

            <div className={`
                px-6 py-4 rounded-2xl
                border backdrop-blur-xl
                shadow-2xl
                flex items-center gap-3
                min-w-[280px]
                max-w-[90vw]

                ${type === 'success'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : ''
                }

                ${type === 'error'
                    ? 'bg-red-500/20 border-red-500 text-red-300'
                    : ''
                }
            `}>

                <div className="text-2xl">
                    {
                        type === 'success'
                            ? '✅'
                            : '⚠️'
                    }
                </div>

                <div className="font-bold">
                    {message}
                </div>

            </div>

        </div>
    );
}