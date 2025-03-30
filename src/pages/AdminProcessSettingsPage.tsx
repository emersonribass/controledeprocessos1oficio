
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const AdminProcessSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A configuração de processos será implementada em breve."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações de Processos</h2>
        <p className="text-muted-foreground">
          Configure as regras e parâmetros para o fluxo de processos no sistema.
        </p>
      </div>

      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Defina as configurações básicas para todos os processos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Esta funcionalidade está em desenvolvimento e será implementada em breve.
                </p>
                <Button onClick={handleSaveSettings} className="mt-4">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure como e quando as notificações serão enviadas aos usuários.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Esta funcionalidade está em desenvolvimento e será implementada em breve.
                </p>
                <Button onClick={handleSaveSettings} className="mt-4">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Automação</CardTitle>
              <CardDescription>
                Configure regras de automação para o fluxo de processos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-10">
                <p className="text-muted-foreground">
                  Esta funcionalidade está em desenvolvimento e será implementada em breve.
                </p>
                <Button onClick={handleSaveSettings} className="mt-4">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProcessSettingsPage;
