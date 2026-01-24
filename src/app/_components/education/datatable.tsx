"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  DataTableBase,
  DataTableColumnHeader,
} from "~/app/_components/data-table";
import { Input } from "~/app/_components/ui/input";
import type { EducationWithSkills } from "~/lib/models/Education";
import { Checkbox } from "~/app/_components/ui/checkbox";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/app/_components/ui/tooltip";
import { FilePen, Trash2 } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import { Link } from "~/app/_components/ui/link";

interface EducationDataTableProps {
  data: EducationWithSkills[];
  children: React.ReactNode;
}

const EducationActionDataTableCell: React.FC<{
  education: EducationWithSkills;
}> = ({ education }) => {
  const router = useRouter();

  const deleteEducation = api.education.delete.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Expérience scolaire supprimée");
    },
    onError: () => {
      toast.error("Une erreur est survenue");
    },
  });

  async function handleDelete() {
    try {
      await deleteEducation.mutateAsync({ id: education.id });
    } catch (error) {
      console.error("Delete education error:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    }
  }

  return (
    <section className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/admin/educations/${education.id}`}
            variant={"icon"}
            size={"icon"}
            className="text-primary p-0"
          >
            <FilePen className="h-4 w-4" />
          </Link>
        </TooltipTrigger>
        <TooltipContent>Modifier</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="icon"
            size={"icon"}
            className="text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-destructive text-primary-foreground border-none">
          Supprimer
        </TooltipContent>
      </Tooltip>
    </section>
  );
};

const columns: ColumnDef<EducationWithSkills>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorFn: (row) => row.school,
    header: "Établissement",
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as string}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.degree,
    header: "Diplôme",
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as string}</div>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Date de début" />;
    },
    cell: (data) => {
      const startDate = data.getValue() as Date | null;
      return (
        <div className="text-xs capitalize">
          {startDate ? format(startDate, "MMMM yyyy", { locale: fr }) : "N/A"}
        </div>
      );
    },
    enableMultiSort: true,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Date de fin" />;
    },
    cell: ({ row }) => {
      const startDate: Date | null = row.getValue("startDate");
      const endDate: Date | null = row.getValue("endDate");
      return (
        <div className="text-xs capitalize">
          {endDate
            ? format(endDate, "MMMM yyyy", { locale: fr })
            : startDate
              ? "En cours"
              : "N/A"}
        </div>
      );
    },
    enableMultiSort: true,
  },
  {
    accessorFn: (row) => row.orderIndex,
    id: "orderIndex",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Ordre" />;
    },
    enableMultiSort: true,
    enableHiding: false,
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as number}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.Skills.length,
    id: "Compétences",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Compétences" />;
    },
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as number}</div>
      );
    },
    enableMultiSort: true,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      return <EducationActionDataTableCell education={row.original} />;
    },
  },
];

const DataTableEducation: React.FC<EducationDataTableProps> = ({
  data,
  children,
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
    enableMultiRowSelection: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    getRowId: (row) => row.id,
  });

  /*  const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => {
    return row.original.id;
  }); */

  return (
    <DataTableBase table={table} columns={columns} selection>
      {children}
      <Input
        placeholder="Chercher une expérience scolaire..."
        value={(table.getColumn("Diplôme")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("Diplôme")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
    </DataTableBase>
  );
};

export { DataTableEducation };
