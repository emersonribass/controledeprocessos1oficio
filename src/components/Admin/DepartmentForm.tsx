
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Department } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Schema de validação para o formulário
const departmentSchema = z.object({
  name: z.string().min(2, "O nome do setor deve ter pelo menos 2 caracteres."),
  order: z.coerce.number().int().min(1, "A ordem deve ser um número inteiro maior que 0."),
  timeLimit: z.coerce.number().int().min(0, "O prazo deve ser um número inteiro maior ou igual a 0.")
});

type DepartmentFormProps = {
  department: Department | null;
  onSave: () => void;
  onCancel: () => void;
  existingDepartments: Department[];
};

type FormValues = z.infer<typeof departmentSchema>;

const DepartmentForm = ({ department, onSave, onCancel, existingDepartments }: DepartmentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Inicializar o formulário com valores default ou do departamento existente
  const form = useForm<FormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || "",
      order: department?.order || getNextAvailableOrder(),
      timeLimit: department?.timeLimit || 0
    }
  });

  // Atualizar formulário quando o departamento for alterado
  useEffect(() => {
    form.reset({
      name: department?.name || "",
      order: department?.order || getNextAvailableOrder(),
      timeLimit: department?.timeLimit || 0
    });
  }, [department, form]);

  // Função para obter a próxima ordem disponível
  function getNextAvailableOrder(): number {
    if (existingDepartments.length === 0) return 1;
    return Math.max(...existingDepartments.map(d => d.order)) + 1;
  }

  // Função para verificar se a ordem já existe
  function orderExists(order: number): boolean {
    return existingDepartments.some(d => d.order === order && (department ? Number(d.id) !== Number(department.id) : true));
  }

  // Manipular o envio do formulário
  const onSubmit = async (data: FormValues) => {
    // Verificar se a ordem já existe
    if (orderExists(data.order)) {
      form.setError("order", { 
        type: "manual", 
        message: "Esta ordem já está em uso por outro setor." 
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (department) {
        // Atualização de departamento existente
        const { error } = await supabase
          .from('departments')
          .update({
            name: data.name,
            order_num: data.order,
            time_limit: data.timeLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', Number(department.id));

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Setor atualizado com sucesso."
        });
      } else {
        // Inserção de novo departamento
        const { error } = await supabase
          .from('departments')
          .insert({
            name: data.name,
            order_num: data.order,
            time_limit: data.timeLimit
          });

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Novo setor criado com sucesso."
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Erro ao salvar departamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o setor.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Setor</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do setor" {...field} />
              </FormControl>
              <FormDescription>
                Nome que identifica o setor no sistema.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormDescription>
                Posição do setor no fluxo de processos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="timeLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prazo (dias)</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormDescription>
                Número de dias que um processo pode permanecer neste setor.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DepartmentForm;
