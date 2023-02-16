/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/solid';
import type { RankingInfo } from '@tanstack/match-sorter-utils';
import { rankItem } from '@tanstack/match-sorter-utils';
import type { Cell, Column, ColumnDef, ColumnFiltersState, FilterFn, Header, HeaderGroup, Row, SortingState } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type { CellContext, Table } from '@tanstack/table-core';
import { createColumnHelper } from '@tanstack/table-core';
import clsx from 'clsx';
import Papaparse from 'papaparse';
import React, { useEffect, useMemo, useState } from 'react';
import type { FileToRender } from '../types/file-to-render';

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// A debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" {...props} value={value} onChange={(e) => setValue(e.target.value)} />
  );
}

function Filter({ column, table }: { column: Column<any, unknown>; table: Table<any> }) {
  const firstValue = table.getPreFilteredRowModel().flatRows[0]?.getValue(column.id);
  const columnFilterValue = column.getFilterValue();
  const sortedUniqueValues = useMemo(() => (typeof firstValue === 'number' ? [] : Array.from(column.getFacetedUniqueValues().keys()).sort()), [column.getFacetedUniqueValues()]);

  return typeof firstValue === 'number' ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[0] ?? ''}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
          placeholder={`Min ${column.getFacetedMinMaxValues()?.[0] ? `(${column.getFacetedMinMaxValues()?.[0]})` : ''}`}
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
          value={(columnFilterValue as [number, number])?.[1] ?? ''}
          onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
          placeholder={`Max ${column.getFacetedMinMaxValues()?.[1] ? `(${column.getFacetedMinMaxValues()?.[1]})` : ''}`}
        />
      </div>
    </div>
  ) : (
    <div className="mt-2">
      <datalist id={`${column.id}list`}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? '') as string}
        onChange={(value) => column.setFilterValue(value)}
        // placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        placeholder="Search..."
        list={`${column.id}list`}
      />
    </div>
  );
}

interface Props {
  fileToRender: FileToRender;
  delimiter: ',' | '\t' | ';' | string;
}

const CsvTsvRenderer = ({ fileToRender, delimiter }: Props) => {
  const columnHelper = createColumnHelper<any>();
  const [parseResult, setParseResult] = useState<Papaparse.ParseResult<any> | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    if (!parseResult || !parseResult.meta || !parseResult.meta.fields) {
      return [];
    }
    return parseResult.meta!.fields!.map((field: string) =>
      columnHelper.accessor(field, {
        id: field,
        header: field,
        cell: (info: CellContext<any, any>) => info.getValue(),
      }),
    );
  }, [parseResult]);

  const table: Table<any> = useReactTable({
    data: parseResult?.data || [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    onSortingChange: setSorting,
  });

  useEffect(() => {
    if (!fileToRender || !fileToRender.content) {
      return;
    }
    const pr = Papaparse.parse(fileToRender.content as string, {
      header: true,
      delimiter,
    });
    setParseResult(pr);
  }, [fileToRender]);

  return (
    <div className="px-6 pt-4 lg:px-8">
      <DebouncedInput value={globalFilter ?? ''} onChange={(value) => setGlobalFilter(String(value))} className="mb-4 p-2 font-lg shadow border border-block" placeholder="Search all columns..." />
      <div className="flow-root">
        <div className="-my-2 -mx-6 overflow-x-auto lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup: HeaderGroup<any>) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header: Header<any, any>, index: number) => {
                        return (
                          <th key={header.id} className={clsx('py-3.5 text-left text-sm font-semibold text-gray-900', index === 0 ? 'pl-6 pr-3' : 'px-3 py-3.5')}>
                            <div className="flex flex-col">
                              <div className="cursor-pointer group inline-flex" onClick={header.column.getToggleSortingHandler()}>
                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                <span className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                                  {{
                                    asc: <ChevronUpIcon className="h-5 w-5" aria-hidden="true" />,
                                    desc: <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />,
                                  }[header.column.getIsSorted() as string] ?? null}
                                </span>
                              </div>
                              {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {table.getRowModel().rows.map((row: Row<any>) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell: Cell<any, any>, index: number) => (
                        <td key={cell.id} className={clsx('whitespace-nowrap text-sm text-gray-900', index === 0 ? 'py-4 pl-6 pr-3 font-medium' : 'px-3 py-4')}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvTsvRenderer;
