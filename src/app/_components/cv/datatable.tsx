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
import type { CvWithRelations } from "~/lib/models/Cv";
import { Checkbox } from "~/app/_components/ui/checkbox";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/app/_components/ui/tooltip";
import { FilePen, Trash2, ExternalLink } from "lucide-react";

import { Button } from "~/app/_components/ui/button";
import { Link } from "~/app/_components/ui/link";
import { Badge } from "~/app/_components/ui/badge";

interface CvDataTableProps {
  data: CvWithRelations[];
  children: React.ReactNode;
}

const CvActionDataTableCell: React.FC<{
  cv: CvWithRelations;
}> = ({ cv }) => {
  const router = useRouter();

  const deleteCv = api.cv.delete.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("CV supprimé");
    },
    onError: () => {
      toast.error("Une erreur est survenue");
    },
  });

  async function handleDelete() {
    try {
      await deleteCv.mutateAsync({ id: cv.id });
    } catch (error) {
      console.error("Delete CV error:", error);
      toast.error(
        error instanceof Error ? error.message : "Une erreur est survenue",
      );
    }
  }

  return (
    <section className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/admin/cvs/${cv.id}`}>
            <Button size="icon" variant="ghost">
              <FilePen className="h-4 w-4" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>Éditer</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/cv/${cv.slug}`} target="_blank">
            <Button size="icon" variant="ghost">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent>Voir le CV</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleteCv.isPending}
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

const columns: ColumnDef<CvWithRelations>[] = [
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
    accessorFn: (row) => row.title,
    header: "Titre",
    cell: (data) => {
      return (
        <div className="text-xs font-medium">{data.getValue() as string}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.slug,
    header: "Slug",
    cell: (data) => {
      return (
        <div className="text-muted-foreground text-xs">
          {data.getValue() as string}
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.theme,
    header: "Thème",
    cell: (data) => {
      return (
        <Badge variant="secondary" className="text-xs">
          {data.getValue() as string}
        </Badge>
      );
    },
  },
  {
    accessorFn: (row) => row.Experiences.length,
    header: "Expériences",
    cell: (data) => {
      return (
        <div className="text-center text-xs">{data.getValue() as number}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.Projects.length,
    header: "Projets",
    cell: (data) => {
      return (
        <div className="text-center text-xs">{data.getValue() as number}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.Skills.length,
    header: "Compétences",
    cell: (data) => {
      return (
        <div className="text-center text-xs">{data.getValue() as number}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.Educations.length,
    header: "Formations",
    cell: (data) => {
      return (
        <div className="text-center text-xs">{data.getValue() as number}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Date de création" />;
    },
    cell: (data) => {
      const createdAt = data.getValue() as Date;
      return (
        <div className="text-xs">
          {format(createdAt, "dd MMMM yyyy", { locale: fr })}
        </div>
      );
    },
    enableMultiSort: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CvActionDataTableCell cv={row.original} />,
  },
];

export function CvDataTable({ data, children }: CvDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    {
      id: "createdAt",
      desc: true,
    },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataTableBase table={table} columns={columns}>
      {children}
      <Input
        placeholder="Filtrer par titre..."
        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
        onChange={(event) =>
          table.getColumn("title")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
    </DataTableBase>
  );
}
