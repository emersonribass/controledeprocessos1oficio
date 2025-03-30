
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { FormUsuario } from "@/types/usuario";

type ProfileFieldsProps = {
  form: UseFormReturn<FormUsuario>;
};

export function ProfileFields({ form }: ProfileFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <FormField
        control={form.control}
        name="perfil"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel>Perfil</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="usuario" id="usuario" />
                  <Label htmlFor="usuario">Usuário</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="administrador" id="administrador" />
                  <Label htmlFor="administrador">Administrador</Label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ativo"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-full">
            <FormLabel>Ativo</FormLabel>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
