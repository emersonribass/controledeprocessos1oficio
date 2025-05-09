
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProcessGenerationForm from "@/components/Admin/ProcessGenerationForm";
import ProcessSettingsGeneral from "@/components/Admin/ProcessSettingsGeneral";

const AdminProcessSettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

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
          <TabsTrigger value="generation">Geração</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <ProcessSettingsGeneral />
        </TabsContent>
        
        <TabsContent value="generation">
          <Card>
            <CardHeader>
              <CardTitle>Geração de Processos</CardTitle>
              <CardDescription>
                Configure a geração automática de novos processos no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProcessGenerationForm />
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProcessSettingsPage;
