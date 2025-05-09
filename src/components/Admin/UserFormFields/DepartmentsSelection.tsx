
import { FormField, FormItem, FormLabel, FormDescription, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UseFormReturn } from "react-hook-form";
import { FormUsuario } from "@/types/usuario";
import { Department } from "@/types";

type DepartmentsSelectionProps = {
  form: UseFormReturn<FormUsuario>;
  departments: Department[];
};

export function DepartmentsSelection({ form, departments }: DepartmentsSelectionProps) {
  // Divide os departamentos em duas colunas
  const halfLength = Math.ceil(departments.length / 2);
  const leftColumnDepartments = departments.slice(0, halfLength);
  const rightColumnDepartments = departments.slice(halfLength);

  return (
    <FormField
      control={form.control}
      name="setores_atribuidos"
      render={() => (
        <FormItem>
          <div className="mb-2">
            <FormLabel className="text-base">Setores atribuídos</FormLabel>
            <FormDescription>
              Selecione os setores aos quais o usuário terá acesso.
            </FormDescription>
          </div>
          <ScrollArea className="h-[200px] rounded-md border p-2">
            <div className="grid grid-cols-2 gap-x-4">
              <div>
                {leftColumnDepartments.map((department) => (
                  <FormField
                    key={department.id}
                    control={form.control}
                    name="setores_atribuidos"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={department.id}
                          className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(department.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, department.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== department.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {department.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <div>
                {rightColumnDepartments.map((department) => (
                  <FormField
                    key={department.id}
                    control={form.control}
                    name="setores_atribuidos"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={department.id}
                          className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(department.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, department.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== department.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {department.name}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
