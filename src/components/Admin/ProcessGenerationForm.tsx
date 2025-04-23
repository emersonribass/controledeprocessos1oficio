
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProcessGeneration } from "@/hooks/useProcessGeneration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  initialNumber: z.coerce.number().positive("Protocolo inicial deve ser positivo"),
  quantity: z.coerce.number().positive("Quantidade deve ser positiva").max(100, "Máximo de 100 processos por vez"),
});

const ProcessGenerationForm = () => {
  const { isGenerating, generateProcesses } = useProcessGeneration();
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialNumber: 1,
      quantity: 10,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSuccess(false);
    const result = await generateProcesses(
      values.initialNumber,
      values.quantity
    );
    
    if (result) {
      setSuccess(true);
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="initialNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protocolo Inicial</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormDescription>
                  Número do protocolo inicial a ser gerado
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="10" {...field} />
                </FormControl>
                <FormDescription>
                  Quantidade de processo(s) a ser(em) gerado(s)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isGenerating}
          className="w-full md:w-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Gerando...
            </>
          ) : (
            "Gerar Processo(s)"
          )}
        </Button>

        {success && (
          <p className="text-green-600 mt-2">
            Processo(s) gerado(s) com sucesso!
          </p>
        )}
      </form>
    </Form>
  );
};

export default ProcessGenerationForm;
