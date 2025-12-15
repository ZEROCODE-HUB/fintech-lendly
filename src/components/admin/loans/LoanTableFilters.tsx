import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowDownAZ, Download } from "lucide-react";
import { ColumnCustomizer } from "./ColumnCustomizer";
import { ColumnConfig } from "@/types/loans";

interface LoanTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortOrder: string;
  onSortChange: (value: string) => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
  showExport?: boolean;
  onExport?: () => void;
}

export const LoanTableFilters = ({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  columns,
  onColumnsChange,
  showExport = false,
  onExport
}: LoanTableFiltersProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={sortOrder} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px]">
          <ArrowDownAZ className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">F. Sol. (más reciente)</SelectItem>
          <SelectItem value="date-asc">F. Sol. (más antigua)</SelectItem>
          <SelectItem value="amount-desc">Monto (mayor)</SelectItem>
          <SelectItem value="amount-asc">Monto (menor)</SelectItem>
          <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
          <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
        </SelectContent>
      </Select>
      <ColumnCustomizer columns={columns} onColumnsChange={onColumnsChange} />
      {showExport && onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      )}
    </div>
  );
};
