import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2 } from "lucide-react";

export default function ChatHistory() {
  const conversations = [
    {
      id: "1",
      title: "Dúvida sobre NBR 5419",
      date: "Hoje às 14:30",
      preview: "Qual é o parágrafo sobre proteção contra descargas atmosféricas?",
    },
    {
      id: "2",
      title: "Consulta ASME B31.3",
      date: "Ontem às 10:15",
      preview: "Quais são os requisitos de inspeção para tubulações de processo?",
    },
    {
      id: "3",
      title: "Norma Petrobras",
      date: "2 dias atrás",
      preview: "Como proceder com testes de penetrante em soldas?",
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Histórico de Conversas</h2>
        <p className="text-slate-600">Retome suas consultas anteriores sobre normas técnicas</p>
      </div>

      {conversations.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Nenhuma conversa ainda. Comece uma nova no chat!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Card key={conv.id} className="p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{conv.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{conv.preview}</p>
                  <p className="text-xs text-slate-500 mt-2">{conv.date}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
