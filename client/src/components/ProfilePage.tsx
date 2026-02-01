import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { User, Mail, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [fullName, setFullName] = useState("João Silva");
  const [email, setEmail] = useState("joao@example.com");
  const [company, setCompany] = useState("Empresa XYZ");
  const [role, setRole] = useState("Inspetor de Soldagem");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Meu Perfil</h2>
        <p className="text-slate-600">Gerencie suas informações pessoais e certificações</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Nome Completo
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="company" className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="role" className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4" />
              Cargo/Especialidade
            </Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Editar Perfil
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 border-red-200 bg-red-50">
        <h3 className="font-semibold text-red-900 mb-4">Zona de Perigo</h3>
        <p className="text-sm text-red-800 mb-4">
          Deletar sua conta é permanente e não pode ser desfeito.
        </p>
        <Button variant="destructive">
          Deletar Minha Conta
        </Button>
      </Card>
    </div>
  );
}
