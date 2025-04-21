
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  search: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SearchFilter = ({ search, onChange, onKeyDown }: SearchFilterProps) => {
  return (
    <div className="relative col-span-1 md:col-span-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
        <Input 
          placeholder="Buscar por número de protocolo" 
          value={search} 
          onChange={(e) => onChange(e.target.value)} 
          onKeyDown={onKeyDown} 
          className="pl-10" 
        />
      </div>
    </div>
  );
};

export default SearchFilter;
