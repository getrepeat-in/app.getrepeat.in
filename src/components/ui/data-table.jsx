import { ShieldAlert, Inbox } from 'lucide-react';

const TableSkeleton = ({ columns }) => (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#f8fafc] dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800">
                <tr>
                    {columns.map((col, index) => (
                        <th key={`skel-th-${col.key || index}`} className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                            <div className={`h-3 bg-gray-200 dark:bg-zinc-700 rounded-full animate-pulse inline-block ${col.align === 'right' ? 'w-16' : 'w-24'}`}></div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <tr key={`skel-tr-${rowIndex}`}>
                        {columns.map((col, colIndex) => (
                            <td key={`skel-td-${rowIndex}-${col.key || colIndex}`} className={`px-6 py-5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}>
                                <div className={`flex items-center gap-3 ${col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'}`}>
                                    {colIndex === 0 && (
                                        <div className="w-11 h-11 rounded-md bg-gray-100 dark:bg-zinc-800 animate-pulse shrink-0"></div>
                                    )}
                                    
                                    {colIndex === columns.length - 1 ? (
                                        <div className="flex gap-2">
                                            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                                            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-zinc-800 animate-pulse"></div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-2 w-full max-w-[140px]">
                                            <div className={`h-4 bg-gray-100 dark:bg-zinc-800 rounded-md animate-pulse ${colIndex === 0 ? 'w-full' : 'w-3/4'}`}></div>
                                            {colIndex === 0 && <div className="h-3 bg-gray-50 dark:bg-zinc-800/50 rounded-md w-2/3 animate-pulse"></div>}
                                        </div>
                                    )}
                                </div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export function DataTable({ 
    columns = [], 
    data = [], 
    isLoading = false, 
    error = null,
    emptyState = { title: "No Data", description: "No records found.", icon: <Inbox size={24} className="text-gray-400" /> }
}) {
    if (isLoading) {
        return <TableSkeleton columns={columns} />;
    }

    if (error) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center text-red-500 bg-red-50 dark:bg-red-500/10 rounded-lg">
                <ShieldAlert className="w-10 h-10 mb-4 opacity-80" />
                <h3 className="text-lg font-bold mb-1">Failed to load</h3>
                <p className="text-sm opacity-80">There was an error fetching the data.</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="p-16 text-center flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-zinc-800 rounded-xl bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-zinc-700">
                    {emptyState.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{emptyState.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">{emptyState.description}</p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
            <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-[#f8fafc] dark:bg-zinc-900 text-gray-500 dark:text-gray-400 text-[10px] font-bold tracking-widest border-b border-gray-100 dark:border-zinc-800">
                    <tr>
                        {columns.map((col, index) => (
                            <th 
                                key={col.key || index} 
                                className={`px-6 py-4 uppercase ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {data.map((row, rowIndex) => (
                        <tr key={row._id || rowIndex} className="hover:bg-gray-50/50 dark:hover:bg-zinc-900/50 transition-colors bg-white dark:bg-zinc-950">
                            {columns.map((col, colIndex) => (
                                <td 
                                    key={`${row._id || rowIndex}-${col.key || colIndex}`} 
                                    className={`px-6 py-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                                >
                                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}