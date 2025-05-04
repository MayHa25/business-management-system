"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
  }[];
  searchable?: boolean;
  searchKeys?: Array<keyof T>;
  actionColumn?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  searchable = false,
  searchKeys = [],
  actionColumn,
  emptyMessage = "אין נתונים להצגה",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = searchable
    ? data.filter((item) =>
        searchKeys.some((key) => {
          const value = String(item[key]).toLowerCase();
          return value.includes(searchTerm.toLowerCase());
        })
      )
    : data;

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש..."
            className="pr-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>
                  {column.header}
                </TableHead>
              ))}
              {actionColumn && <TableHead>פעולות</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {column.cell
                        ? column.cell(item)
                        : String(item[column.accessorKey])}
                    </TableCell>
                  ))}
                  {actionColumn && (
                    <TableCell>{actionColumn(item)}</TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actionColumn ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}