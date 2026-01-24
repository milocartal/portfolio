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

import {
  DataTableBase,
  DataTableColumnHeader,
} from "~/app/_components/data-table";
import { Input } from "~/app/_components/ui/input";
import { type ProjectWithSkills } from "~/lib/models/Project";
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
import Image from "next/image";

interface ProjectDataTableProps {
  data: ProjectWithSkills[];
  children: React.ReactNode;
}

const ProjectActionDataTableCell: React.FC<{
  project: ProjectWithSkills;
}> = ({ project }) => {
  const router = useRouter();

  const deleteProject = api.project.delete.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Projet supprimé");
    },
    onError: () => {
      toast.error("Une erreur est survenue");
    },
  });

  async function handleDelete() {
    try {
      await deleteProject.mutateAsync({ id: project.id });
    } catch (error) {
      console.error("Delete project error:", error);
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
            href={`/admin/projects/${project.id}`}
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

const columns: ColumnDef<ProjectWithSkills>[] = [
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
    accessorFn: (row) => row.name,
    header: "Nom",
    cell: (data) => {
      return (
        <div className="text-xs capitalize">{data.getValue() as string}</div>
      );
    },
  },
  {
    accessorFn: (row) => row.picture,
    header: "Image",
    cell: (data) => {
      const picture = data.getValue() as string | null;
      return picture ? (
        <div className="h-12 w-16 overflow-hidden rounded">
          <Image
            src={picture}
            alt="Project"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="text-muted-foreground text-xs italic">N/A</div>
      );
    },
  },
  {
    accessorFn: (row) => row.previewText,
    header: "Prévisualisation",
    cell: (data) => {
      const preview = data.getValue() as string | null;
      return preview ? (
        <div className="max-w-xs truncate text-xs">{preview}</div>
      ) : (
        <div className="text-muted-foreground text-xs italic">N/A</div>
      );
    },
  },
  {
    accessorFn: (row) => row.repoUrl,
    header: "URL du dépôt",
    cell: (data) => {
      const repoUrl = data.getValue() as string | null;
      return repoUrl ? (
        <Link
          href={repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs"
        >
          {repoUrl}
        </Link>
      ) : (
        <div className="text-muted-foreground text-xs italic">N/A</div>
      );
    },
  },
  {
    accessorFn: (row) => row.url,
    header: "URL du projet",
    cell: (data) => {
      const url = data.getValue() as string | null;
      return url ? (
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs"
        >
          {url}
        </Link>
      ) : (
        <div className="text-muted-foreground text-xs italic">N/A</div>
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
      return <ProjectActionDataTableCell project={row.original} />;
    },
  },
];

const DataTableProject: React.FC<ProjectDataTableProps> = ({
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
        placeholder="Chercher une expérience professionnelle..."
        value={
          (table.getColumn("Entreprise")?.getFilterValue() as string) ?? ""
        }
        onChange={(event) =>
          table.getColumn("Entreprise")?.setFilterValue(event.target.value)
        }
        className="max-w-sm"
      />
    </DataTableBase>
  );
};

export { DataTableProject };
